import { eq } from 'drizzle-orm';
import { db } from './db';
import { book, bookAccess, invite, question, type Book } from './db/schema';
import { hashPassword, hashToken, newToken, verifyPassword } from './crypto';
import { getTemplate } from '$lib/templates';
import { notify } from './ntfy';

export type CreateBookInput = {
	title: string;
	subtitle?: string;
	introText?: string;
	templateId: string;
	theme: string;
	moderationMode: 'instant' | 'review';
	recoveryEmail?: string;
	passwords?: { admin?: string; read?: string; write?: string };
};

export type CreatedBook = {
	bookId: string;
	tokens: { admin: string; read: string; write: string };
};

/** Legt Buch, die drei Zugangs-Links und die Vorlagen-Fragen in einer Transaktion an. */
export async function createBook(input: CreateBookInput): Promise<CreatedBook> {
	const tpl = getTemplate(input.templateId);
	if (!tpl) throw new Error(`Unbekannte Vorlage: ${input.templateId}`);

	const tokens = {
		admin: newToken(),
		read: newToken(),
		write: newToken()
	};

	const [adminPw, readPw, writePw] = await Promise.all([
		input.passwords?.admin ? hashPassword(input.passwords.admin) : Promise.resolve(null),
		input.passwords?.read ? hashPassword(input.passwords.read) : Promise.resolve(null),
		input.passwords?.write ? hashPassword(input.passwords.write) : Promise.resolve(null)
	]);

	const bookId = await db.transaction(async (tx) => {
		const [created] = await tx
			.insert(book)
			.values({
				title: input.title,
				subtitle: input.subtitle || null,
				introText: input.introText || null,
				design: { theme: input.theme },
				questionPickLeft: tpl.pick.left,
				questionPickRight: tpl.pick.right,
				moderationMode: input.moderationMode,
				recoveryEmail: input.recoveryEmail || null
			})
			.returning({ id: book.id });

		await tx.insert(bookAccess).values([
			{
				bookId: created.id,
				role: 'admin',
				tokenHash: hashToken(tokens.admin),
				passwordHash: adminPw
			},
			{ bookId: created.id, role: 'read', tokenHash: hashToken(tokens.read), passwordHash: readPw }
		]);

		await tx.insert(invite).values({
			bookId: created.id,
			kind: 'open',
			label: 'Offener Eintragen-Link',
			tokenHash: hashToken(tokens.write),
			passwordHash: writePw,
			maxEntries: null
		});

		// Voller Fragen-Pool der Vorlage landet im Buch; welche Fragen eine
		// einzelne Person davon zu sehen bekommt, wird erst beim Schreiben
		// eines Eintrags zufällig gezogen (siehe /schreiben load).
		await tx.insert(question).values(
			tpl.questions.map((q, i) => ({
				bookId: created.id,
				position: i,
				label: q.label,
				fieldType: q.fieldType,
				section: q.section,
				required: q.required ?? false
			}))
		);

		return created.id;
	});

	await notify({
		title: 'Neues Buch',
		message: `„${input.title}" wurde angelegt.`,
		tags: 'sparkles'
	});

	return { bookId, tokens };
}

export type LinkRole = 'admin' | 'read' | 'write';

export type BookAccessResult = {
	book: Book;
	role: LinkRole;
	/** id des book_access- bzw. invite-Datensatzes (für den Entsperrt-Cookie) */
	accessId: string;
	hasPassword: boolean;
	/** bei role === 'write' die zugehörige Einladung */
	inviteId?: string;
	invitePrefillName?: string | null;
};

/**
 * Löst einen Buch-Link-Token auf – egal ob Admin-/Ansehen-Link (book_access)
 * oder Eintragen-Link (invite). Gibt null zurück, wenn der Token unbekannt oder
 * die Einladung zurückgezogen ist.
 */
export async function resolveAccess(token: string): Promise<BookAccessResult | null> {
	const tokenHash = hashToken(token);

	const accessRow = await db.query.bookAccess.findFirst({
		where: eq(bookAccess.tokenHash, tokenHash),
		with: { book: true }
	});
	if (accessRow?.book) {
		return {
			book: accessRow.book,
			role: accessRow.role,
			accessId: accessRow.id,
			hasPassword: accessRow.passwordHash !== null
		};
	}

	const inviteRow = await db.query.invite.findFirst({
		where: eq(invite.tokenHash, tokenHash),
		with: { book: true }
	});
	if (inviteRow?.book && inviteRow.revokedAt === null) {
		return {
			book: inviteRow.book,
			role: 'write',
			accessId: inviteRow.id,
			hasPassword: inviteRow.passwordHash !== null,
			inviteId: inviteRow.id,
			invitePrefillName: inviteRow.prefillName
		};
	}

	return null;
}

/** Prüft das Link-Passwort für einen beliebigen Buch-Link-Token. */
export async function verifyAccessPassword(token: string, password: string): Promise<boolean> {
	const tokenHash = hashToken(token);

	const accessRow = await db.query.bookAccess.findFirst({
		where: eq(bookAccess.tokenHash, tokenHash),
		columns: { passwordHash: true }
	});
	const hash =
		accessRow?.passwordHash ??
		(
			await db.query.invite.findFirst({
				where: eq(invite.tokenHash, tokenHash),
				columns: { passwordHash: true }
			})
		)?.passwordHash;

	if (hash === undefined) return false;
	if (hash === null) return true;
	return verifyPassword(hash, password);
}
