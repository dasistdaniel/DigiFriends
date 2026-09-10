import { error, json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { asset } from '$lib/server/db/schema';
import { loadBookAccess, requireWrite } from '$lib/server/guard';
import { MAX_UPLOAD_BYTES } from '$lib/server/env';
import { processImage, saveAsset, storedPath, type AssetKind } from '$lib/server/storage';
import type { RequestHandler } from './$types';

const KINDS: AssetKind[] = ['avatar', 'photo', 'drawing'];

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) error(403, 'Gesperrt.');
	requireWrite(access);

	const form = await request.formData();
	const file = form.get('file');
	const kindRaw = String(form.get('kind') ?? 'photo');
	const kind: AssetKind = KINDS.includes(kindRaw as AssetKind) ? (kindRaw as AssetKind) : 'photo';

	if (!(file instanceof File)) error(400, 'Keine Datei erhalten.');
	if (file.size === 0) error(400, 'Die Datei ist leer.');
	if (file.size > MAX_UPLOAD_BYTES) {
		error(413, `Die Datei ist zu groß (max. ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB).`);
	}
	if (!file.type.startsWith('image/')) error(415, 'Bitte ein Bild hochladen.');

	let processed;
	try {
		processed = await processImage(Buffer.from(await file.arrayBuffer()), kind);
	} catch {
		error(422, 'Dieses Bild konnte nicht verarbeitet werden.');
	}

	const [row] = await db
		.insert(asset)
		.values({
			bookId: access.book.id,
			kind,
			path: '',
			thumbPath: '',
			width: processed.width,
			height: processed.height
		})
		.returning({ id: asset.id });
	const assetId = row.id;

	await saveAsset(access.book.id, assetId, processed);
	await db
		.update(asset)
		.set({
			path: storedPath(access.book.id, assetId),
			thumbPath: `${access.book.id}/${assetId}_t.webp`
		})
		.where(and(eq(asset.id, assetId), eq(asset.bookId, access.book.id)));

	return json({
		id: assetId,
		width: processed.width,
		height: processed.height,
		url: `/b/${params.token}/asset/${assetId}`,
		thumbUrl: `/b/${params.token}/asset/${assetId}/thumb`
	});
};
