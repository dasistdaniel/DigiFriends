import { and, asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { entry, question } from '$lib/server/db/schema';
import { loadBookAccess } from '$lib/server/guard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return { locked: true as const };

	const bookId = access.book.id;

	const [questions, entries] = await Promise.all([
		db.query.question.findMany({
			where: eq(question.bookId, bookId),
			orderBy: asc(question.position)
		}),
		db.query.entry.findMany({
			where: and(eq(entry.bookId, bookId), eq(entry.state, 'published')),
			orderBy: [asc(entry.position), asc(entry.publishedAt)],
			with: { answers: true, assets: true }
		})
	]);

	const assetBase = `/b/${params.token}/asset`;
	type Pos = { order?: number; rotate?: number };

	return {
		locked: false as const,
		book: {
			title: access.book.title,
			subtitle: access.book.subtitle,
			introText: access.book.introText
		},
		questions: questions.map((q) => ({
			id: q.id,
			label: q.label,
			section: q.section,
			fieldType: q.fieldType
		})),
		entries: entries.map((e) => {
			const avatar = e.avatarAssetId ? e.assets.find((a) => a.id === e.avatarAssetId) : undefined;
			const photos = e.assets
				.filter((a) => a.kind === 'photo')
				.sort((a, b) => ((a.position as Pos)?.order ?? 0) - ((b.position as Pos)?.order ?? 0));
			return {
				id: e.id,
				displayName: e.displayName || 'Anonym',
				closingLine: e.closingLine,
				answers: Object.fromEntries(e.answers.map((a) => [a.questionId, a.valueText])),
				avatar: avatar ? { thumb: `${assetBase}/${avatar.id}/thumb` } : null,
				photos: photos.map((p) => ({
					id: p.id,
					thumb: `${assetBase}/${p.id}/thumb`,
					full: `${assetBase}/${p.id}`,
					rotate: (p.position as Pos)?.rotate ?? 0
				}))
			};
		})
	};
};
