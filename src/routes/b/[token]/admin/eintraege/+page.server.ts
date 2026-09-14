import { fail } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { asset, entry } from '$lib/server/db/schema';
import { loadBookAccess, requireAdmin } from '$lib/server/guard';
import { deleteAsset } from '$lib/server/storage';
import { logAudit } from '$lib/server/audit';
import type { Actions, PageServerLoad } from './$types';

async function bookId(params: { token: string }, cookies: import('@sveltejs/kit').Cookies) {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return null;
	requireAdmin(access);
	return access.book.id;
}

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return { locked: true as const };
	requireAdmin(access);

	const entries = await db.query.entry.findMany({
		where: eq(entry.bookId, access.book.id),
		orderBy: [asc(entry.position), asc(entry.createdAt)],
		with: { answers: { with: { question: true } }, assets: true }
	});

	const assetBase = `/b/${params.token}/asset`;

	const mapped = entries.map((e) => {
		// Jeder Eintrag hat seine eigene Fragenauswahl; die Vorschau zeigt
		// dessen erste tatsaechlich beantwortete Frage (nach Position sortiert).
		const firstAnswer = [...e.answers]
			.filter((a) => a.valueText.trim().length > 0)
			.sort((a, b) => a.question.position - b.question.position)[0];

		return {
			id: e.id,
			displayName: e.displayName || 'Anonym',
			state: e.state,
			position: e.position,
			createdAt: e.createdAt,
			preview: firstAnswer?.valueText ?? '',
			photoCount: e.assets.filter((a) => a.kind === 'photo').length,
			drawingCount: e.assets.filter((a) => a.kind === 'drawing').length,
			avatar: e.avatarAssetId ? `${assetBase}/${e.avatarAssetId}/thumb` : null
		};
	});

	return {
		locked: false as const,
		queue: mapped.filter((e) => e.state === 'submitted' || e.state === 'draft'),
		entries: mapped.filter((e) => e.state === 'published' || e.state === 'hidden')
	};
};

export const actions: Actions = {
	publish: async ({ request, params, cookies }) => {
		const id = await bookId(params, cookies);
		if (!id) return fail(403);
		const entryId = String((await request.formData()).get('id') ?? '');
		const [e] = await db
			.update(entry)
			.set({ state: 'published', publishedAt: new Date() })
			.where(and(eq(entry.id, entryId), eq(entry.bookId, id)))
			.returning({ displayName: entry.displayName });
		await logAudit({
			bookId: id,
			actorRole: 'admin',
			action: 'entry.publish',
			meta: { entryDisplayName: e?.displayName }
		});
		return { ok: true };
	},

	hide: async ({ request, params, cookies }) => {
		const id = await bookId(params, cookies);
		if (!id) return fail(403);
		const entryId = String((await request.formData()).get('id') ?? '');
		const [e] = await db
			.update(entry)
			.set({ state: 'hidden' })
			.where(and(eq(entry.id, entryId), eq(entry.bookId, id)))
			.returning({ displayName: entry.displayName });
		await logAudit({
			bookId: id,
			actorRole: 'admin',
			action: 'entry.hide',
			meta: { entryDisplayName: e?.displayName }
		});
		return { ok: true };
	},

	unhide: async ({ request, params, cookies }) => {
		const id = await bookId(params, cookies);
		if (!id) return fail(403);
		const entryId = String((await request.formData()).get('id') ?? '');
		const [e] = await db
			.update(entry)
			.set({ state: 'published' })
			.where(and(eq(entry.id, entryId), eq(entry.bookId, id)))
			.returning({ displayName: entry.displayName });
		await logAudit({
			bookId: id,
			actorRole: 'admin',
			action: 'entry.unhide',
			meta: { entryDisplayName: e?.displayName }
		});
		return { ok: true };
	},

	delete: async ({ request, params, cookies }) => {
		const id = await bookId(params, cookies);
		if (!id) return fail(403);
		const entryId = String((await request.formData()).get('id') ?? '');

		const [assets, existing] = await Promise.all([
			db.query.asset.findMany({ where: and(eq(asset.entryId, entryId), eq(asset.bookId, id)) }),
			db.query.entry.findFirst({
				where: and(eq(entry.id, entryId), eq(entry.bookId, id)),
				columns: { displayName: true }
			})
		]);
		await logAudit({
			bookId: id,
			actorRole: 'admin',
			action: 'entry.delete',
			meta: { entryDisplayName: existing?.displayName }
		});

		await db.delete(entry).where(and(eq(entry.id, entryId), eq(entry.bookId, id)));
		await Promise.allSettled(assets.map((a) => deleteAsset(id, a.id)));
		return { ok: true };
	},

	reorder: async ({ request, params, cookies }) => {
		const id = await bookId(params, cookies);
		if (!id) return fail(403);
		const order = String((await request.formData()).get('order') ?? '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);

		await db.transaction(async (tx) => {
			for (let i = 0; i < order.length; i++) {
				await tx
					.update(entry)
					.set({ position: i })
					.where(and(eq(entry.id, order[i]), eq(entry.bookId, id)));
			}
		});
		return { ok: true };
	}
};
