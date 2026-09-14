import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { and, asc, eq, notInArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { book, question } from '$lib/server/db/schema';
import { loadBookAccess, requireAdmin } from '$lib/server/guard';
import { templates, getTemplate } from '$lib/templates';
import type { Actions, PageServerLoad } from './$types';

const questionSchema = z.object({
	id: z.string().uuid().optional(),
	label: z.string().trim().min(1).max(200),
	fieldType: z.enum(['short', 'long', 'date']),
	section: z.enum(['left', 'right']),
	required: z.boolean()
});
const payloadSchema = z.array(questionSchema).min(1).max(60);

async function adminBookId(
	params: { token: string },
	cookies: import('@sveltejs/kit').Cookies
): Promise<string | null> {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return null;
	requireAdmin(access);
	return access.book.id;
}

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return { locked: true as const };
	requireAdmin(access);

	const questions = await db.query.question.findMany({
		where: eq(question.bookId, access.book.id),
		orderBy: asc(question.position)
	});

	return {
		locked: false as const,
		questions: questions.map((q) => ({
			id: q.id,
			label: q.label,
			fieldType: q.fieldType,
			section: q.section,
			required: q.required
		})),
		templates: templates.map(({ id, name, description, questions, pick }) => ({
			id,
			name,
			description,
			questions,
			pick
		}))
	};
};

async function replaceQuestions(
	bookId: string,
	items: z.infer<typeof payloadSchema>
): Promise<void> {
	await db.transaction(async (tx) => {
		const keepIds = items.filter((i) => i.id).map((i) => i.id!) as string[];

		// entfernte Fragen (samt Antworten per Cascade) löschen
		if (keepIds.length) {
			await tx
				.delete(question)
				.where(and(eq(question.bookId, bookId), notInArray(question.id, keepIds)));
		} else {
			await tx.delete(question).where(eq(question.bookId, bookId));
		}

		for (let i = 0; i < items.length; i++) {
			const it = items[i];
			if (it.id) {
				await tx
					.update(question)
					.set({
						label: it.label,
						fieldType: it.fieldType,
						section: it.section,
						required: it.required,
						position: i
					})
					.where(and(eq(question.id, it.id), eq(question.bookId, bookId)));
			} else {
				await tx.insert(question).values({
					bookId,
					label: it.label,
					fieldType: it.fieldType,
					section: it.section,
					required: it.required,
					position: i
				});
			}
		}
	});
}

export const actions: Actions = {
	save: async ({ request, params, cookies }) => {
		const bookId = await adminBookId(params, cookies);
		if (!bookId) return fail(403, { message: 'Kein Zugriff.' });

		let raw: unknown;
		try {
			raw = JSON.parse(String((await request.formData()).get('questions') ?? '[]'));
		} catch {
			return fail(400, { message: 'Ungültige Daten.' });
		}
		const parsed = payloadSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { message: 'Bitte jede Frage mit Text ausfüllen (max. 40 Fragen).' });
		}

		await replaceQuestions(bookId, parsed.data);
		return { saved: true };
	},

	applyTemplate: async ({ request, params, cookies }) => {
		const bookId = await adminBookId(params, cookies);
		if (!bookId) return fail(403, { message: 'Kein Zugriff.' });

		const tpl = getTemplate(String((await request.formData()).get('templateId') ?? ''));
		if (!tpl) return fail(400, { message: 'Unbekannte Vorlage.' });

		await replaceQuestions(
			bookId,
			tpl.questions.map((q) => ({
				label: q.label,
				fieldType: q.fieldType,
				section: q.section,
				required: q.required ?? false
			}))
		);
		await db
			.update(book)
			.set({ questionPickLeft: tpl.pick.left, questionPickRight: tpl.pick.right })
			.where(eq(book.id, bookId));
		return { saved: true, applied: tpl.name };
	}
};
