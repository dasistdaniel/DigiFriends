import { and, isNull, lt } from 'drizzle-orm';
import { db } from './db';
import { asset } from './db/schema';
import { deleteAsset } from './storage';

/**
 * Uploads, die keinem Eintrag zugeordnet sind (abgebrochenes Anlegen, im
 * Bild-/Zeichnen-Picker wieder entfernt bevor abgeschickt wurde), gelten erst
 * nach dieser Frist als verwaist – das lässt Zeit für eine laufende
 * Formular-Sitzung, in der ein Bild kurzzeitig noch keinem Eintrag hängt.
 */
const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;

/** Löscht verwaiste Asset-Zeilen (DB) und die zugehörigen Bilddateien. */
export async function cleanupOrphanedAssets(): Promise<number> {
	const cutoff = new Date(Date.now() - ORPHAN_GRACE_MS);
	const deleted = await db
		.delete(asset)
		.where(and(isNull(asset.entryId), lt(asset.createdAt, cutoff)))
		.returning({ id: asset.id, bookId: asset.bookId });

	if (!deleted.length) return 0;

	await Promise.allSettled(deleted.map((a) => deleteAsset(a.bookId, a.id)));
	console.log(`[cleanup] ${deleted.length} verwaiste Asset(s) entfernt.`);
	return deleted.length;
}
