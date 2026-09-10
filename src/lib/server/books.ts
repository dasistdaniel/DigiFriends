import { eq } from 'drizzle-orm';
import { db } from './db';
import { book, bookAccess, invite, question, type Book } from './db/schema';
import { hashPassword, hashToken, newToken } from './crypto';
import { getTemplate } from '$lib/templates';

export type CreateBookInput = {
	title: string;
	subtitle?: string;
	introText?: string;
	templateId: string;
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

	return { bookId, tokens };
}

export type AccessRole = 'admin' | 'read';

export type BookAccessResult = {
	book: Book;
	role: AccessRole;
	accessId: string;
	hasPassword: boolean;
};

/** Löst einen Admin-/Ansehen-Token zu Buch + Rolle auf. */
export async function resolveAccess(token: string): Promise<BookAccessResult | null> {
	const row = await db.query.bookAccess.findFirst({
		where: eq(bookAccess.tokenHash, hashToken(token)),
		with: { book: true }
	});
	if (!row || !row.book) return null;
	return {
		book: row.book,
		role: row.role,
		accessId: row.id,
		hasPassword: row.passwordHash !== null
	};
}
