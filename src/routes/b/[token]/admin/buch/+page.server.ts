import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { asset, book } from '$lib/server/db/schema';
import { loadBookAccess, requireAdmin } from '$lib/server/guard';
import { deleteAsset } from '$lib/server/storage';
import { bookThemes, resolveBookThemeId } from '$lib/bookThemes';
import type { Actions, PageServerLoad } from './$types';

async function adminBook(params: { token: string }, cookies: import('@sveltejs/kit').Cookies) {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return null;
	requireAdmin(access);
	return access.book;
}

const settingsSchema = z.object({
	title: z.string().trim().min(1, 'Titel darf nicht leer sein.').max(120),
	subtitle: z.string().trim().max(120),
	introText: z.string().trim().max(2000),
	moderationMode: z.enum(['instant', 'review']),
	openWriteEnabled: z.boolean(),
	recoveryEmail: z
		.string()
		.trim()
		.max(200)
		.refine((v) => v === '' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'Ungültige E-Mail-Adresse.'),
	theme: z.enum(bookThemes.map((t) => t.id) as [string, ...string[]])
});

export const load: PageServerLoad = async ({ params, cookies }) => {
	const b = await adminBook(params, cookies);
	if (!b) return { locked: true as const };
	return {
		locked: false as const,
		themes: bookThemes,
		settings: {
			title: b.title,
			subtitle: b.subtitle ?? '',
			introText: b.introText ?? '',
			moderationMode: b.moderationMode,
			openWriteEnabled: b.openWriteEnabled,
			recoveryEmail: b.recoveryEmail ?? '',
			status: b.status,
			theme: resolveBookThemeId((b.design as { theme?: unknown } | null)?.theme)
		}
	};
};

export const actions: Actions = {
	save: async ({ request, params, cookies }) => {
		const b = await adminBook(params, cookies);
		if (!b) return fail(403, { message: 'Kein Zugriff.' });

		const fd = await request.formData();
		const parsed = settingsSchema.safeParse({
			title: fd.get('title'),
			subtitle: fd.get('subtitle') ?? '',
			introText: fd.get('introText') ?? '',
			moderationMode: fd.get('moderationMode'),
			openWriteEnabled: fd.get('openWriteEnabled') === 'on',
			recoveryEmail: fd.get('recoveryEmail') ?? '',
			theme: fd.get('theme')
		});
		if (!parsed.success) {
			return fail(400, {
				message: z.flattenError(parsed.error).formErrors.join(' ') || 'Bitte Eingaben prüfen.'
			});
		}
		const d = parsed.data;
		await db
			.update(book)
			.set({
				title: d.title,
				subtitle: d.subtitle || null,
				introText: d.introText || null,
				moderationMode: d.moderationMode,
				openWriteEnabled: d.openWriteEnabled,
				recoveryEmail: d.recoveryEmail || null,
				design: { theme: d.theme },
				updatedAt: new Date()
			})
			.where(eq(book.id, b.id));
		return { saved: true };
	},

	status: async ({ request, params, cookies }) => {
		const b = await adminBook(params, cookies);
		if (!b) return fail(403, { message: 'Kein Zugriff.' });
		const to = String((await request.formData()).get('to') ?? '');
		if (!['open', 'closed', 'archived'].includes(to)) return fail(400);
		await db
			.update(book)
			.set({ status: to as 'open' | 'closed' | 'archived', updatedAt: new Date() })
			.where(eq(book.id, b.id));
		return { saved: true };
	},

	deleteBook: async ({ request, params, cookies }) => {
		const b = await adminBook(params, cookies);
		if (!b) return fail(403, { message: 'Kein Zugriff.' });
		if (String((await request.formData()).get('confirm') ?? '') !== b.title) {
			return fail(400, { message: 'Der eingegebene Titel stimmt nicht.' });
		}

		const assets = await db.query.asset.findMany({ where: eq(asset.bookId, b.id) });
		await db.delete(book).where(eq(book.id, b.id));
		await Promise.allSettled(assets.map((a) => deleteAsset(b.id, a.id)));
		redirect(303, '/');
	}
};
