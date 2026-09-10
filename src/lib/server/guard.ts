import { error, type Cookies } from '@sveltejs/kit';
import { resolveAccess, type BookAccessResult } from './books';
import { isUnlocked } from './access';

export type BookGuard = { access: BookAccessResult; locked: boolean };

/** Löst den Token auf, 404 wenn unbekannt, und meldet den Sperr-Status. */
export async function loadBookAccess(token: string, cookies: Cookies): Promise<BookGuard> {
	const access = await resolveAccess(token);
	if (!access) error(404, 'Dieses Buch gibt es nicht (mehr).');
	const locked = access.hasPassword && !isUnlocked(cookies, access.accessId);
	return { access, locked };
}

export function requireAdmin(access: BookAccessResult): void {
	if (access.role !== 'admin') error(403, 'Dieser Link darf das Buch nicht verwalten.');
}

export function requireWrite(access: BookAccessResult): void {
	if (access.role !== 'write' && access.role !== 'admin') {
		error(403, 'Dieser Link darf keine Einträge hinzufügen.');
	}
}
