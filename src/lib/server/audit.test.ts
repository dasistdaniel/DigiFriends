import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { db } from './db';
import { auditLog, book } from './db/schema';
import { logAudit } from './audit';

describe('logAudit', () => {
	const bookIds: string[] = [];

	afterAll(async () => {
		for (const id of bookIds) {
			await db.delete(book).where(eq(book.id, id));
		}
	});

	async function makeBook(): Promise<string> {
		const [b] = await db.insert(book).values({ title: 'Audit-Test' }).returning({ id: book.id });
		bookIds.push(b.id);
		return b.id;
	}

	it('writes a row with the given fields', async () => {
		const bookId = await makeBook();
		await logAudit({
			bookId,
			actorRole: 'admin',
			action: 'book.status-change',
			meta: { to: 'closed', bookTitle: 'Audit-Test' }
		});

		const rows = await db.query.auditLog.findMany({ where: eq(auditLog.bookId, bookId) });
		expect(rows).toHaveLength(1);
		expect(rows[0].actorRole).toBe('admin');
		expect(rows[0].action).toBe('book.status-change');
		expect(rows[0].meta).toEqual({ to: 'closed', bookTitle: 'Audit-Test' });
	});

	it('survives the book being deleted (bookId set to null, meta keeps the title)', async () => {
		const bookId = await makeBook();
		await logAudit({
			bookId,
			actorRole: 'operator',
			action: 'book.delete',
			meta: { bookTitle: 'Audit-Test' }
		});

		await db.delete(book).where(eq(book.id, bookId));
		bookIds.splice(bookIds.indexOf(bookId), 1);

		const rows = await db.query.auditLog.findMany({
			where: eq(auditLog.action, 'book.delete')
		});
		const row = rows.find(
			(r) => (r.meta as { bookTitle?: string } | null)?.bookTitle === 'Audit-Test'
		);
		expect(row).toBeDefined();
		expect(row?.bookId).toBeNull();

		if (row) await db.delete(auditLog).where(eq(auditLog.id, row.id));
	});
});
