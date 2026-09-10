import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { UPLOAD_DIR } from './env';

export type AssetKind = 'avatar' | 'photo' | 'drawing';

export type ProcessedImage = {
	full: Buffer;
	thumb: Buffer;
	width: number;
	height: number;
};

/**
 * Verarbeitet ein hochgeladenes Bild: EXIF-Orientierung anwenden und Metadaten
 * verwerfen (re-encode), auf sinnvolle Kantenlänge begrenzen, als WebP + Thumbnail.
 * Wirft, wenn der Puffer kein lesbares Bild ist.
 */
export async function processImage(input: Buffer, kind: AssetKind): Promise<ProcessedImage> {
	const meta = await sharp(input).metadata();
	if (!meta.width || !meta.height) throw new Error('Kein gültiges Bild.');

	const maxDim = kind === 'avatar' ? 800 : 2000;
	const full = await sharp(input)
		.rotate()
		.resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 82 })
		.toBuffer({ resolveWithObject: true });
	const thumb = await sharp(input)
		.rotate()
		.resize(480, 480, { fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 72 })
		.toBuffer();

	return { full: full.data, thumb, width: full.info.width, height: full.info.height };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assetPaths(bookId: string, assetId: string) {
	if (!UUID_RE.test(bookId) || !UUID_RE.test(assetId)) throw new Error('Ungültige ID.');
	const dir = join(UPLOAD_DIR, bookId);
	return {
		dir,
		full: join(dir, `${assetId}.webp`),
		thumb: join(dir, `${assetId}_t.webp`)
	};
}

export function storedPath(bookId: string, assetId: string): string {
	return `${bookId}/${assetId}.webp`;
}

export async function saveAsset(
	bookId: string,
	assetId: string,
	img: ProcessedImage
): Promise<void> {
	const p = assetPaths(bookId, assetId);
	await mkdir(p.dir, { recursive: true });
	await Promise.all([writeFile(p.full, img.full), writeFile(p.thumb, img.thumb)]);
}

export async function readAsset(
	bookId: string,
	assetId: string,
	variant: 'full' | 'thumb'
): Promise<Buffer> {
	const p = assetPaths(bookId, assetId);
	return readFile(variant === 'thumb' ? p.thumb : p.full);
}

export async function deleteAsset(bookId: string, assetId: string): Promise<void> {
	const p = assetPaths(bookId, assetId);
	await Promise.allSettled([unlink(p.full), unlink(p.thumb)]);
}
