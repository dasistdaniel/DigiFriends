import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import { deleteAsset, processImage, readAsset, saveAsset, storedPath } from './storage';
import { UPLOAD_DIR } from './env';

async function testImage(width: number, height: number): Promise<Buffer> {
	return sharp({
		create: { width, height, channels: 3, background: { r: 180, g: 60, b: 40 } }
	})
		.png()
		.toBuffer();
}

describe('processImage', () => {
	it('re-encodes a valid image as WebP and reports dimensions', async () => {
		const input = await testImage(100, 80);
		const result = await processImage(input, 'photo');

		expect(result.width).toBe(100);
		expect(result.height).toBe(80);
		expect((await sharp(result.full).metadata()).format).toBe('webp');
		expect((await sharp(result.thumb).metadata()).format).toBe('webp');
	});

	it('never enlarges a smaller-than-target image', async () => {
		const input = await testImage(50, 40);
		const result = await processImage(input, 'avatar');
		expect(result.width).toBe(50);
		expect(result.height).toBe(40);
	});

	it('caps avatars at a smaller edge length than photos/drawings', async () => {
		const input = await testImage(3000, 1000);
		const avatar = await processImage(input, 'avatar');
		const photo = await processImage(input, 'photo');

		expect(avatar.width).toBe(800);
		expect(photo.width).toBe(2000);
	});

	it('produces a thumbnail no larger than the full image', async () => {
		const input = await testImage(3000, 1000);
		const { width, height, thumb } = await processImage(input, 'photo');
		const thumbMeta = await sharp(thumb).metadata();
		expect(thumbMeta.width!).toBeLessThanOrEqual(width);
		expect(thumbMeta.height!).toBeLessThanOrEqual(height);
	});

	it('rejects a buffer that is not a readable image', async () => {
		await expect(processImage(Buffer.from('not an image'), 'photo')).rejects.toThrow();
	});
});

describe('storedPath', () => {
	it('joins bookId and assetId into the public asset path', () => {
		expect(storedPath('book-1', 'asset-1')).toBe('book-1/asset-1.webp');
	});
});

describe('saveAsset / readAsset / deleteAsset', () => {
	const bookId = randomUUID();

	afterEach(async () => {
		await rm(join(UPLOAD_DIR, bookId), { recursive: true, force: true });
	});

	it('round-trips a saved asset and cleans it up on delete', async () => {
		const assetId = randomUUID();
		const input = await testImage(40, 40);
		const img = await processImage(input, 'photo');

		await saveAsset(bookId, assetId, img);
		await expect(readAsset(bookId, assetId, 'full')).resolves.toBeInstanceOf(Buffer);
		await expect(readAsset(bookId, assetId, 'thumb')).resolves.toBeInstanceOf(Buffer);

		await deleteAsset(bookId, assetId);
		await expect(readAsset(bookId, assetId, 'full')).rejects.toThrow();
	});

	it('rejects non-UUID ids before touching the filesystem', async () => {
		const img = await processImage(await testImage(10, 10), 'photo');
		await expect(saveAsset('../escape', randomUUID(), img)).rejects.toThrow('Ungültige ID.');
		await expect(readAsset(bookId, 'not-a-uuid', 'full')).rejects.toThrow('Ungültige ID.');
		await expect(deleteAsset(bookId, 'not-a-uuid')).rejects.toThrow('Ungültige ID.');
	});
});
