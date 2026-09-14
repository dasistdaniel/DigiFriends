import { redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { auditLog } from '$lib/server/db/schema';
import { isOperatorSession, operatorEnabled } from '$lib/server/operator';
import type { PageServerLoad } from './$types';

const LIMIT = 200;

export const load: PageServerLoad = async ({ cookies }) => {
	if (!operatorEnabled() || !isOperatorSession(cookies)) {
		redirect(303, '/betreiber');
	}

	const logs = await db.query.auditLog.findMany({
		orderBy: desc(auditLog.createdAt),
		limit: LIMIT,
		with: { book: { columns: { id: true, title: true } } }
	});

	return {
		entries: logs.map((l) => {
			const meta = (l.meta as Record<string, unknown> | null) ?? {};
			return {
				id: l.id,
				createdAt: l.createdAt.toISOString(),
				actorRole: l.actorRole,
				action: l.action,
				bookId: l.book?.id ?? null,
				bookTitle: l.book?.title ?? (typeof meta.bookTitle === 'string' ? meta.bookTitle : null),
				meta
			};
		}),
		limit: LIMIT
	};
};
