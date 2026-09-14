import { error } from '@sveltejs/kit';
import { Readable } from 'node:stream';
import { ZipArchive, type ArchiverError } from 'archiver';
import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { entry } from '$lib/server/db/schema';
import { loadBookAccess, requireAdmin } from '$lib/server/guard';
import { readAsset } from '$lib/server/storage';
import type { RequestHandler } from './$types';

/** Dateisystem-taugliche Kurzform eines Namens (keine Pfad-Trenner/Steuerzeichen). */
function slug(name: string, fallback: string): string {
	const cleaned = name
		// eslint-disable-next-line no-control-regex -- Steuerzeichen sollen bewusst entfernt werden
		.replace(/[\x00-\x1f/\\:*?"<>|]/g, ' ')
		.trim()
		.slice(0, 60);
	return cleaned || fallback;
}

const STATE_LABEL: Record<string, string> = {
	draft: 'Entwurf',
	submitted: 'Warteschlange',
	published: 'Veröffentlicht',
	hidden: 'Verborgen'
};

export const GET: RequestHandler = async ({ params, cookies }) => {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) error(403, 'Gesperrt.');
	requireAdmin(access);

	const b = access.book;
	const entries = await db.query.entry.findMany({
		where: eq(entry.bookId, b.id),
		orderBy: [asc(entry.position), asc(entry.createdAt)],
		with: { answers: { with: { question: true } }, assets: true }
	});

	const archive = new ZipArchive({ zlib: { level: 9 } });
	archive.on('warning', (err: ArchiverError) => console.error('[export] Zip-Warnung:', err));
	archive.on('error', (err: ArchiverError) => console.error('[export] Zip-Fehler:', err));

	const bookInfo = [
		b.title,
		b.subtitle ?? '',
		'',
		b.introText ?? '',
		'',
		`Exportiert am: ${new Date().toISOString()}`,
		`Einträge gesamt: ${entries.length}`
	].join('\n');
	archive.append(bookInfo, { name: 'buch.txt' });

	const usedNames = new Map<string, number>();
	for (const e of entries) {
		const base = slug(e.displayName, 'ohne-namen');
		const n = (usedNames.get(base) ?? 0) + 1;
		usedNames.set(base, n);
		const folder = `eintraege/${String(e.position + 1).padStart(3, '0')}-${base}${n > 1 ? `-${n}` : ''}`;

		const qa = [...e.answers]
			.sort((x, y) => x.question.position - y.question.position)
			.filter((a) => a.valueText.trim().length > 0)
			.map((a) => `${a.question.label}\n${a.valueText}`)
			.join('\n\n');

		const text = [
			`Name: ${e.displayName}`,
			`Status: ${STATE_LABEL[e.state] ?? e.state}`,
			`Erstellt am: ${e.createdAt.toISOString()}`,
			'',
			qa,
			'',
			e.closingLine ? `Schlusswort: ${e.closingLine}` : ''
		]
			.join('\n')
			.trim();
		archive.append(text, { name: `${folder}/text.txt` });

		for (const a of e.assets) {
			const bytes = await readAsset(b.id, a.id, 'full').catch(() => null);
			if (!bytes) continue;
			const fileName =
				a.kind === 'avatar'
					? 'avatar.webp'
					: a.kind === 'photo'
						? `fotos/foto-${a.id}.webp`
						: `zeichnungen/zeichnung-${a.id}.webp`;
			archive.append(bytes, { name: `${folder}/${fileName}` });
		}
	}

	// Nicht auf finalize() warten: erst wenn die Antwort zurückgegeben wird
	// und die Plattform den Stream tatsächlich liest, läuft archiver weiter
	// (sonst würde der interne Puffer voll laufen und alles blockieren).
	archive.finalize().catch((err: unknown) => console.error('[export] Finalize-Fehler:', err));

	const safeTitle = slug(b.title, 'freundebuch');
	return new Response(Readable.toWeb(archive) as ReadableStream, {
		headers: {
			'content-type': 'application/zip',
			'content-disposition': `attachment; filename="${safeTitle}.zip"`
		}
	});
};
