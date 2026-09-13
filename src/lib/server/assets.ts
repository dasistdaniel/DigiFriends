import { error, type Cookies } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from './db';
import { asset } from './db/schema';
import { loadBookAccess } from './guard';
import { isOperatorSession } from './operator';
import { readAsset } from './storage';

/** Liefert ein Bild nur aus, wenn der Buch-Link gültig und entsperrt ist. */
export async function serveAsset(
	token: string,
	assetId: string,
	cookies: Cookies,
	variant: 'full' | 'thumb'
): Promise<Response> {
	const { access, locked } = await loadBookAccess(token, cookies);
	if (locked) error(403, 'Gesperrt.');

	const row = await db.query.asset.findFirst({
		where: and(eq(asset.id, assetId), eq(asset.bookId, access.book.id)),
		with: { entry: true }
	});
	if (!row) error(404, 'Bild nicht gefunden.');

	// Ansehen-Rolle sieht keine Bilder aus noch nicht freigegebenen Einträgen
	if (access.role === 'read' && row.entryId && row.entry?.state !== 'published') {
		error(404, 'Bild nicht gefunden.');
	}

	let data: Buffer;
	try {
		data = await readAsset(access.book.id, assetId, variant);
	} catch {
		error(404, 'Bild nicht gefunden.');
	}

	return new Response(new Uint8Array(data), {
		headers: {
			'content-type': 'image/webp',
			'cache-control': 'private, max-age=3600',
			'content-length': String(data.length)
		}
	});
}

/** Wie serveAsset, aber für den Betreiber-Bereich: Zugriff über Operator-Sitzung statt Buch-Link. */
export async function serveAssetForOperator(
	cookies: Cookies,
	bookId: string,
	assetId: string,
	variant: 'full' | 'thumb'
): Promise<Response> {
	if (!isOperatorSession(cookies)) error(403, 'Kein Zugriff.');

	const row = await db.query.asset.findFirst({
		where: and(eq(asset.id, assetId), eq(asset.bookId, bookId))
	});
	if (!row) error(404, 'Bild nicht gefunden.');

	let data: Buffer;
	try {
		data = await readAsset(bookId, assetId, variant);
	} catch {
		error(404, 'Bild nicht gefunden.');
	}

	return new Response(new Uint8Array(data), {
		headers: {
			'content-type': 'image/webp',
			'cache-control': 'private, max-age=3600',
			'content-length': String(data.length)
		}
	});
}
