import { and, eq } from 'drizzle-orm';
import { db } from './db';
import { entry } from './db/schema';
import { hashToken } from './crypto';
import type { BookAccessResult } from './books';

/**
 * Findet den zu bearbeitenden Eintrag:
 * - Admin-Link: `key` ist die Eintrags-id
 * - sonst: `key` ist der Bearbeitungs-Token (Hash-Vergleich)
 */
export async function findEditableEntry(access: BookAccessResult, key: string) {
	if (access.role === 'admin') {
		return db.query.entry.findFirst({
			where: and(eq(entry.id, key), eq(entry.bookId, access.book.id)),
			with: { answers: true, assets: true }
		});
	}
	return db.query.entry.findFirst({
		where: and(eq(entry.editTokenHash, hashToken(key)), eq(entry.bookId, access.book.id)),
		with: { answers: true, assets: true }
	});
}
