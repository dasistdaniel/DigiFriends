import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from './db';
import { book, bookAccess, recoveryRequest } from './db/schema';
import { hashToken, newToken } from './crypto';
import { checkRecoveryToken, redeemRecovery } from './recovery';

describe('checkRecoveryToken / redeemRecovery', () => {
	const bookIds: string[] = [];

	afterAll(async () => {
		for (const id of bookIds) {
			await db.delete(book).where(eq(book.id, id));
		}
	});

	async function makeBookWithAdmin(): Promise<{ bookId: string; oldAdminToken: string }> {
		const [b] = await db.insert(book).values({ title: 'Recovery-Test' }).returning({ id: book.id });
		bookIds.push(b.id);

		const oldAdminToken = newToken();
		await db
			.insert(bookAccess)
			.values({ bookId: b.id, role: 'admin', tokenHash: hashToken(oldAdminToken) });

		return { bookId: b.id, oldAdminToken };
	}

	async function makeRecoveryRow(bookId: string, opts: { ageMs?: number; used?: boolean } = {}) {
		const token = newToken();
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000 - (opts.ageMs ?? 0));
		await db.insert(recoveryRequest).values({
			bookId,
			tokenHash: hashToken(token),
			expiresAt,
			usedAt: opts.used ? new Date() : null
		});
		return token;
	}

	it('reports an unknown token as invalid', async () => {
		const result = await checkRecoveryToken('does-not-exist');
		expect(result).toEqual({ ok: false, reason: 'invalid' });
	});

	it('reports an expired token as expired', async () => {
		const { bookId } = await makeBookWithAdmin();
		const token = await makeRecoveryRow(bookId, { ageMs: 2 * 60 * 60 * 1000 });

		const result = await checkRecoveryToken(token);
		expect(result).toEqual({ ok: false, reason: 'expired' });
	});

	it('reports an already-used token as used', async () => {
		const { bookId } = await makeBookWithAdmin();
		const token = await makeRecoveryRow(bookId, { used: true });

		const result = await checkRecoveryToken(token);
		expect(result).toEqual({ ok: false, reason: 'used' });
	});

	it('check does not consume the token (redeem still works afterwards)', async () => {
		const { bookId } = await makeBookWithAdmin();
		const token = await makeRecoveryRow(bookId);

		const check = await checkRecoveryToken(token);
		expect(check).toEqual({ ok: true, bookTitle: 'Recovery-Test' });

		const redeemed = await redeemRecovery(token);
		expect(redeemed.ok).toBe(true);
	});

	it('redeeming rotates the admin token, invalidating the old one, and is single-use', async () => {
		const { bookId, oldAdminToken } = await makeBookWithAdmin();
		const token = await makeRecoveryRow(bookId);

		const redeemed = await redeemRecovery(token);
		expect(redeemed.ok).toBe(true);
		if (!redeemed.ok) throw new Error('unreachable');
		expect(redeemed.bookTitle).toBe('Recovery-Test');
		expect(redeemed.adminLink).toContain('/admin');

		const newAdminToken = redeemed.adminLink.split('/b/')[1].split('/admin')[0];
		expect(newAdminToken).not.toBe(oldAdminToken);

		const access = await db.query.bookAccess.findFirst({
			where: eq(bookAccess.bookId, bookId)
		});
		expect(access?.tokenHash).toBe(hashToken(newAdminToken));
		expect(access?.tokenHash).not.toBe(hashToken(oldAdminToken));

		const row = await db.query.recoveryRequest.findFirst({
			where: eq(recoveryRequest.tokenHash, hashToken(token))
		});
		expect(row?.usedAt).not.toBeNull();

		const secondAttempt = await redeemRecovery(token);
		expect(secondAttempt).toEqual({ ok: false, reason: 'used' });
	});
});
