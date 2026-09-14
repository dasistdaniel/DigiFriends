import { fail, redirect } from '@sveltejs/kit';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { book } from '$lib/server/db/schema';
import { computeBookActivity } from '$lib/server/bookActivity';
import { INACTIVE_AFTER_DAYS, UPLOAD_DIR } from '$lib/server/env';
import {
	clearOperatorSession,
	isOperatorSession,
	markOperatorSession,
	operatorEnabled,
	verifyOperatorPassword
} from '$lib/server/operator';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	if (!operatorEnabled() || !isOperatorSession(cookies)) return { books: [] };

	const books = await db.query.book.findMany({
		orderBy: desc(book.createdAt),
		with: {
			entries: { columns: { id: true, state: true, createdAt: true, updatedAt: true } }
		}
	});

	return {
		books: books.map((b) => {
			const { lastActivityAt, inactive } = computeBookActivity(
				b.updatedAt,
				b.entries.map((e) => e.updatedAt),
				INACTIVE_AFTER_DAYS
			);

			return {
				id: b.id,
				title: b.title,
				createdAt: b.createdAt.toISOString(),
				status: b.status,
				suspended: b.suspendedAt !== null,
				entryCount: b.entries.length,
				publishedCount: b.entries.filter((e) => e.state === 'published').length,
				lastActivityAt: lastActivityAt.toISOString(),
				inactive
			};
		})
	};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		if (!operatorEnabled()) {
			return fail(503, { message: 'Betreiber-Bereich ist nicht konfiguriert.' });
		}
		const fd = await request.formData();
		const password = String(fd.get('password') ?? '');
		if (!verifyOperatorPassword(password)) {
			return fail(400, { message: 'Passwort stimmt nicht.' });
		}
		markOperatorSession(cookies);
		redirect(303, '/betreiber');
	},

	logout: async ({ cookies }) => {
		clearOperatorSession(cookies);
		redirect(303, '/betreiber');
	},

	toggleSuspend: async ({ request, cookies }) => {
		if (!isOperatorSession(cookies)) return fail(403);
		const fd = await request.formData();
		const id = String(fd.get('id') ?? '');
		const to = String(fd.get('to') ?? '');
		if (!id || (to !== 'suspend' && to !== 'unsuspend')) return fail(400);

		await db
			.update(book)
			.set({ suspendedAt: to === 'suspend' ? new Date() : null, updatedAt: new Date() })
			.where(eq(book.id, id));

		return { saved: true };
	},

	deleteBook: async ({ request, cookies }) => {
		if (!isOperatorSession(cookies)) return fail(403);
		const id = String((await request.formData()).get('id') ?? '');
		if (!id) return fail(400);

		await db.delete(book).where(eq(book.id, id));
		await rm(join(UPLOAD_DIR, id), { recursive: true, force: true });

		return { deleted: id };
	}
};
