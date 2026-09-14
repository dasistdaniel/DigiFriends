import { and, eq, sql } from 'drizzle-orm';
import { db } from './db';
import { book, bookAccess, recoveryRequest } from './db/schema';
import { hashToken, newToken } from './crypto';
import { sendMail } from './mail';
import { MAIL_ENABLED, ORIGIN } from './env';

/** Wiederherstellungs-Links sind eine Stunde gültig und nur einmal nutzbar. */
const RECOVERY_TTL_MS = 60 * 60 * 1000;

/**
 * Sucht alle Bücher mit dieser Wiederherstellungs-Adresse (i.d.R. genau eins,
 * aber eine Adresse kann für mehrere Bücher hinterlegt sein) und verschickt
 * je einen Einmal-Link. Meldet nie, ob die Adresse tatsächlich existiert –
 * das entscheidet der Aufrufer über eine immer gleiche Erfolgsmeldung.
 */
export async function requestRecovery(email: string): Promise<void> {
	if (!MAIL_ENABLED) return;
	const normalized = email.trim().toLowerCase();
	if (!normalized) return;

	const books = await db.query.book.findMany({
		where: sql`lower(${book.recoveryEmail}) = ${normalized}`
	});

	for (const b of books) {
		const token = newToken();
		await db.insert(recoveryRequest).values({
			bookId: b.id,
			tokenHash: hashToken(token),
			expiresAt: new Date(Date.now() + RECOVERY_TTL_MS)
		});
		const link = `${ORIGIN}/wiederherstellen/${token}`;
		await sendMail({
			to: normalized,
			subject: `Admin-Zugang für „${b.title}“ wiederherstellen`,
			text: [
				`Hallo,`,
				``,
				`für dein Freundebuch „${b.title}“ wurde eine Wiederherstellung des Admin-Links angefordert.`,
				``,
				`Über diesen Link erzeugst du einen neuen Admin-Link (der alte wird dabei ungültig):`,
				link,
				``,
				`Der Link ist eine Stunde gültig und nur einmal nutzbar.`,
				`Wenn du das nicht warst, kannst du diese E-Mail einfach ignorieren.`
			].join('\n')
		}).catch(() => {
			// Versandfehler bewusst verschlucken: der Aufrufer zeigt so oder so
			// immer dieselbe Erfolgsmeldung, unabhängig vom tatsächlichen Ergebnis.
		});
	}
}

export type RecoveryCheck =
	{ ok: true; bookTitle: string } | { ok: false; reason: 'invalid' | 'expired' | 'used' };

export type RecoveryRedeem =
	| { ok: true; bookTitle: string; adminLink: string }
	| { ok: false; reason: 'invalid' | 'expired' | 'used' };

async function findValidRequest(token: string) {
	const row = await db.query.recoveryRequest.findFirst({
		where: eq(recoveryRequest.tokenHash, hashToken(token)),
		with: { book: true }
	});
	if (!row || !row.book) return { row: null, reason: 'invalid' as const };
	if (row.usedAt) return { row: null, reason: 'used' as const };
	if (row.expiresAt.getTime() < Date.now()) return { row: null, reason: 'expired' as const };
	return { row, reason: null };
}

/** Rein lesende Prüfung, verbraucht den Link noch nicht (schützt vor Link-Prefetch durch Mail-Scanner). */
export async function checkRecoveryToken(token: string): Promise<RecoveryCheck> {
	const { row, reason } = await findValidRequest(token);
	if (!row) return { ok: false, reason };
	return { ok: true, bookTitle: row.book.title };
}

/** Löst den Link ein: neuer Admin-Token, alter damit ungültig, Link als verbraucht markiert. */
export async function redeemRecovery(token: string): Promise<RecoveryRedeem> {
	const { row, reason } = await findValidRequest(token);
	if (!row) return { ok: false, reason };

	const newAdminToken = newToken();
	await db.transaction(async (tx) => {
		await tx
			.update(bookAccess)
			.set({ tokenHash: hashToken(newAdminToken) })
			.where(and(eq(bookAccess.bookId, row.bookId), eq(bookAccess.role, 'admin')));
		await tx
			.update(recoveryRequest)
			.set({ usedAt: new Date() })
			.where(eq(recoveryRequest.id, row.id));
	});

	return { ok: true, bookTitle: row.book.title, adminLink: `${ORIGIN}/b/${newAdminToken}/admin` };
}
