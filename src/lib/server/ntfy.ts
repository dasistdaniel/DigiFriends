import { NTFY_TOKEN, NTFY_URL } from './env';

/**
 * Schickt eine Push-Benachrichtigung an den konfigurierten ntfy-Topic (z. B.
 * "neues Buch angelegt"). Ohne gesetzte NTFY_URL wird nichts verschickt.
 * Fehler werden nur geloggt, nie weitergereicht - eine fehlgeschlagene
 * Benachrichtigung darf die eigentliche Aktion nie verhindern.
 *
 * `title`/`tags` sind fest im Aufrufer codierte, ASCII-sichere Strings;
 * dynamische Inhalte (Buchtitel, Namen mit Umlauten etc.) gehören in
 * `message` (HTTP-Body, uneingeschränkt UTF-8-faehig) - nicht in Header,
 * die nur Latin-1 zuverlässig transportieren.
 */
export async function notify(opts: {
	title: string;
	message: string;
	tags?: string;
}): Promise<void> {
	if (!NTFY_URL) return;
	try {
		const headers: Record<string, string> = { Title: opts.title };
		if (opts.tags) headers.Tags = opts.tags;
		if (NTFY_TOKEN) headers.Authorization = `Bearer ${NTFY_TOKEN}`;

		const res = await fetch(NTFY_URL, { method: 'POST', headers, body: opts.message });
		if (!res.ok) {
			console.error(`[ntfy] Server antwortete mit ${res.status}`);
		}
	} catch (err) {
		console.error('[ntfy] Benachrichtigung fehlgeschlagen:', err);
	}
}
