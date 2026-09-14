import { db } from './db';
import { auditLog } from './db/schema';

/**
 * Wer eine Aktion ausgeloest hat: 'admin' = Buch-Admin im eigenen
 * Admin-Bereich, 'operator' = Betreiber im /betreiber-Bereich, 'system' =
 * automatisierter Vorgang ohne eingeloggte Person (z. B. E-Mail-Wiederherstellung).
 */
export type AuditActor = 'admin' | 'operator' | 'system';

/**
 * Schreibt einen Eintrag ins Audit-Log (sichtbar im Betreiber-Bereich unter
 * "Verlauf"). Nie fehlschlagen lassen, wofür sie steht: ein Logging-Fehler
 * darf die eigentliche Aktion (z. B. ein Buch loeschen) nicht verhindern.
 *
 * `meta` sollte alles enthalten, was den Eintrag auch nach dem Loeschen des
 * Buchs noch lesbar macht (z. B. `bookTitle`) - die FK auf `book` steht auf
 * SET NULL, der Log-Eintrag selbst bleibt also erhalten.
 */
export async function logAudit(entry: {
	bookId?: string | null;
	actorRole: AuditActor;
	action: string;
	meta?: Record<string, unknown>;
}): Promise<void> {
	try {
		await db.insert(auditLog).values({
			bookId: entry.bookId ?? null,
			actorRole: entry.actorRole,
			action: entry.action,
			meta: entry.meta ?? null
		});
	} catch (err) {
		console.error('[audit] Log-Eintrag fehlgeschlagen:', err);
	}
}
