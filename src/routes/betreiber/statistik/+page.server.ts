import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { isOperatorSession, operatorEnabled } from '$lib/server/operator';
import type { PageServerLoad } from './$types';

function daysAgo(n: number): Date {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d;
}

export const load: PageServerLoad = async ({ cookies }) => {
	if (!operatorEnabled() || !isOperatorSession(cookies)) {
		redirect(303, '/betreiber');
	}

	const [books, entries, assets] = await Promise.all([
		db.query.book.findMany({
			columns: { id: true, status: true, suspendedAt: true, createdAt: true, title: true }
		}),
		db.query.entry.findMany({ columns: { id: true, state: true, createdAt: true, bookId: true } }),
		db.query.asset.findMany({ columns: { id: true, kind: true } })
	]);

	const since7 = daysAgo(7);
	const since30 = daysAgo(30);

	const entryCountByBook = new Map<string, number>();
	for (const e of entries) {
		if (e.state !== 'published') continue;
		entryCountByBook.set(e.bookId, (entryCountByBook.get(e.bookId) ?? 0) + 1);
	}
	const topBooks = books
		.map((b) => ({ title: b.title, count: entryCountByBook.get(b.id) ?? 0 }))
		.filter((b) => b.count > 0)
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);

	return {
		books: {
			total: books.length,
			open: books.filter((b) => b.status === 'open').length,
			closed: books.filter((b) => b.status === 'closed').length,
			archived: books.filter((b) => b.status === 'archived').length,
			suspended: books.filter((b) => b.suspendedAt !== null).length,
			new7: books.filter((b) => b.createdAt >= since7).length,
			new30: books.filter((b) => b.createdAt >= since30).length
		},
		entries: {
			total: entries.length,
			published: entries.filter((e) => e.state === 'published').length,
			pending: entries.filter((e) => e.state === 'submitted').length,
			draft: entries.filter((e) => e.state === 'draft').length,
			hidden: entries.filter((e) => e.state === 'hidden').length,
			new7: entries.filter((e) => e.createdAt >= since7).length
		},
		assets: {
			total: assets.length,
			photos: assets.filter((a) => a.kind === 'photo').length,
			avatars: assets.filter((a) => a.kind === 'avatar').length,
			drawings: assets.filter((a) => a.kind === 'drawing').length
		},
		topBooks
	};
};
