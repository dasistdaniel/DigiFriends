import { error, fail, redirect } from '@sveltejs/kit';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { asset, entry, entryAnswer, question } from '$lib/server/db/schema';
import { loadBookAccess } from '$lib/server/guard';
import { findEditableEntry } from '$lib/server/entries';
import { deleteAsset } from '$lib/server/storage';
import { MAX_PHOTOS_PER_ENTRY } from '$lib/server/env';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return { locked: true as const };

	const e = await findEditableEntry(access, params.editToken);
	if (!e) error(404, 'Dieser Eintrag existiert nicht (mehr).');

	const questions = await db.query.question.findMany({
		where: eq(question.bookId, access.book.id),
		orderBy: asc(question.position)
	});

	const assetBase = `/b/${params.token}/asset`;
	const avatar = e.avatarAssetId ? e.assets.find((a) => a.id === e.avatarAssetId) : undefined;
	const drawing = e.drawingAssetId ? e.assets.find((a) => a.id === e.drawingAssetId) : undefined;
	const photos = e.assets
		.filter((a) => a.kind === 'photo')
		.sort(
			(a, b) =>
				((a.position as { order?: number })?.order ?? 0) -
				((b.position as { order?: number })?.order ?? 0)
		);

	return {
		locked: false as const,
		isAdmin: access.role === 'admin',
		questions: questions.map((q) => ({
			id: q.id,
			label: q.label,
			section: q.section,
			fieldType: q.fieldType,
			required: q.required
		})),
		entry: {
			state: e.state,
			displayName: e.displayName,
			closingLine: e.closingLine ?? '',
			answers: Object.fromEntries(e.answers.map((a) => [a.questionId, a.valueText])),
			avatar: avatar ? { id: avatar.id, thumbUrl: `${assetBase}/${avatar.id}/thumb` } : undefined,
			drawing: drawing
				? {
						id: drawing.id,
						thumbUrl: `${assetBase}/${drawing.id}/thumb`,
						url: `${assetBase}/${drawing.id}`
					}
				: undefined,
			photos: photos.map((p) => ({ id: p.id, thumbUrl: `${assetBase}/${p.id}/thumb` }))
		}
	};
};

export const actions: Actions = {
	save: async ({ request, params, cookies }) => {
		const { access, locked } = await loadBookAccess(params.token, cookies);
		if (locked) return fail(403, { message: 'Gesperrt.' });

		const e = await findEditableEntry(access, params.editToken);
		if (!e) return fail(404, { message: 'Eintrag nicht gefunden.' });

		const fd = await request.formData();
		const displayName = String(fd.get('displayName') ?? '').trim();
		const closingLine = String(fd.get('closingLine') ?? '').trim();

		const questions = await db.query.question.findMany({
			where: eq(question.bookId, access.book.id),
			orderBy: asc(question.position)
		});
		const answers = questions.map((q) => ({
			questionId: q.id,
			value: String(fd.get(`q_${q.id}`) ?? '').trim()
		}));

		if (!displayName) return fail(400, { message: 'Bitte trag deinen Namen ein.' });
		const missing = questions.find(
			(q) => q.required && !answers.find((a) => a.questionId === q.id)?.value
		);
		if (missing) return fail(400, { message: `Bitte beantworte: „${missing.label}"` });

		// gewünschte Bilder
		const wantAvatar = String(fd.get('avatarAssetId') ?? '').trim();
		const wantDrawing = String(fd.get('drawingAssetId') ?? '').trim();
		const wantPhotos = String(fd.get('photoAssetIds') ?? '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.slice(0, MAX_PHOTOS_PER_ENTRY);

		const currentPhotoIds = e.assets.filter((a) => a.kind === 'photo').map((a) => a.id);
		const currentAvatarId = e.avatarAssetId ?? '';
		const currentDrawingId = e.drawingAssetId ?? '';

		// neu hinzugefügte Bilder: müssen zum Buch gehören und frei sein
		const addedIds = [
			...(wantAvatar && wantAvatar !== currentAvatarId ? [wantAvatar] : []),
			...(wantDrawing && wantDrawing !== currentDrawingId ? [wantDrawing] : []),
			...wantPhotos.filter((id) => !currentPhotoIds.includes(id))
		];
		const freshAssets = addedIds.length
			? await db.query.asset.findMany({
					where: and(
						eq(asset.bookId, access.book.id),
						isNull(asset.entryId),
						inArray(asset.id, addedIds)
					)
				})
			: [];
		const okAdd = new Set(freshAssets.map((a) => a.id));

		const finalAvatar =
			wantAvatar === currentAvatarId
				? currentAvatarId || null
				: wantAvatar && (okAdd.has(wantAvatar) || currentPhotoIds.includes(wantAvatar))
					? wantAvatar
					: null;
		const finalDrawing =
			wantDrawing === currentDrawingId
				? currentDrawingId || null
				: wantDrawing && okAdd.has(wantDrawing)
					? wantDrawing
					: null;
		const finalPhotos = wantPhotos.filter((id) => currentPhotoIds.includes(id) || okAdd.has(id));

		const removedAssetIds = [
			...currentPhotoIds.filter((id) => !finalPhotos.includes(id)),
			...(currentAvatarId && currentAvatarId !== finalAvatar ? [currentAvatarId] : []),
			...(currentDrawingId && currentDrawingId !== finalDrawing ? [currentDrawingId] : [])
		];

		await db.transaction(async (tx) => {
			await tx
				.update(entry)
				.set({
					displayName,
					closingLine: closingLine || null,
					avatarAssetId: finalAvatar,
					drawingAssetId: finalDrawing,
					updatedAt: new Date()
				})
				.where(eq(entry.id, e.id));

			// Antworten neu setzen
			await tx.delete(entryAnswer).where(eq(entryAnswer.entryId, e.id));
			const withValues = answers.filter((a) => a.value.length > 0);
			if (withValues.length) {
				await tx
					.insert(entryAnswer)
					.values(
						withValues.map((a) => ({ entryId: e.id, questionId: a.questionId, valueText: a.value }))
					);
			}

			// Bilder anbinden / Position
			if (finalAvatar) {
				await tx.update(asset).set({ entryId: e.id }).where(eq(asset.id, finalAvatar));
			}
			if (finalDrawing) {
				await tx.update(asset).set({ entryId: e.id }).where(eq(asset.id, finalDrawing));
			}
			for (let i = 0; i < finalPhotos.length; i++) {
				await tx
					.update(asset)
					.set({
						entryId: e.id,
						position: { order: i, rotate: Math.round((Math.random() * 8 - 4) * 10) / 10 }
					})
					.where(eq(asset.id, finalPhotos[i]));
			}
			// entfernte Bilder löschen
			for (const id of removedAssetIds) {
				await tx.delete(asset).where(and(eq(asset.id, id), eq(asset.bookId, access.book.id)));
			}
		});
		await Promise.allSettled(removedAssetIds.map((id) => deleteAsset(access.book.id, id)));

		return { saved: true };
	},

	deleteEntry: async ({ params, cookies }) => {
		const { access, locked } = await loadBookAccess(params.token, cookies);
		if (locked) return fail(403, { message: 'Gesperrt.' });

		const e = await findEditableEntry(access, params.editToken);
		if (!e) return fail(404, { message: 'Eintrag nicht gefunden.' });

		const assets = await db.query.asset.findMany({ where: eq(asset.entryId, e.id) });
		await db.delete(entry).where(eq(entry.id, e.id));
		await Promise.allSettled(assets.map((a) => deleteAsset(access.book.id, a.id)));

		redirect(303, `/b/${params.token}/lesen`);
	}
};
