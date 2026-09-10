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
			with: { answers: true }
		})
	]);

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
		entries: entries.map((e) => ({
			id: e.id,
			displayName: e.displayName || 'Anonym',
			closingLine: e.closingLine,
			answers: Object.fromEntries(e.answers.map((a) => [a.questionId, a.valueText]))
		}))
	};
};
