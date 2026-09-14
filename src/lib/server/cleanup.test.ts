import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from './db';
import { asset, book } from './db/schema';
import { cleanupOrphanedAssets } from './cleanup';
import { UPLOAD_DIR } from './env';

describe('cleanupOrphanedAssets', () => {
	const bookIds: string[] = [];

	afterAll(async () => {
		for (const id of bookIds) {
			await db.delete(book).where(eq(book.id, id));
		}
	});

	async function makeBook(): Promise<string> {
		const [b] = await db.insert(book).values({ title: 'Cleanup-Test' }).returning({ id: book.id });
		bookIds.push(b.id);
		return b.id;
	}

	async function makeOrphanAsset(bookId: string, ageMs: number): Promise<string> {
		const createdAt = new Date(Date.now() - ageMs);
		const [a] = await db
			.insert(asset)
			.values({ bookId, kind: 'photo', path: '', thumbPath: '', createdAt })
			.returning({ id: asset.id });

		const dir = join(UPLOAD_DIR, bookId);
		await mkdir(dir, { recursive: true });
		await writeFile(join(dir, `${a.id}.webp`), 'x');
		await writeFile(join(dir, `${a.id}_t.webp`), 'x');
		return a.id;
	}

	it('removes only entry-less assets older than the grace period, DB row and file alike', async () => {
		const bookId = await makeBook();
		const oldOrphanId = await makeOrphanAsset(bookId, 25 * 60 * 60 * 1000);
		const recentOrphanId = await makeOrphanAsset(bookId, 60 * 1000);

		const removed = await cleanupOrphanedAssets();
		expect(removed).toBeGreaterThanOrEqual(1);

		const remaining = await db.query.asset.findMany({ where: eq(asset.bookId, bookId) });
		const remainingIds = remaining.map((r) => r.id);
		expect(remainingIds).not.toContain(oldOrphanId);
		expect(remainingIds).toContain(recentOrphanId);

		await expect(readFile(join(UPLOAD_DIR, bookId, `${oldOrphanId}.webp`))).rejects.toThrow();
		await expect(
			readFile(join(UPLOAD_DIR, bookId, `${recentOrphanId}.webp`))
		).resolves.toBeDefined();
	});
});
