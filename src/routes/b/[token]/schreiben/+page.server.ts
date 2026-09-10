import { fail } from '@sveltejs/kit';
import { asc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { entry, entryAnswer, invite, question } from '$lib/server/db/schema';
import { newToken, hashToken } from '$lib/server/crypto';
import { loadBookAccess, requireWrite } from '$lib/server/guard';
import { ORIGIN } from '$lib/server/env';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return { locked: true as const };
	requireWrite(access);

	if (access.book.status !== 'open') {
		return { locked: false as const, closed: true, book: { title: access.book.title } };
	}

	const questions = await db.query.question.findMany({
		where: eq(question.bookId, access.book.id),
		orderBy: asc(question.position)
	});

	return {
		locked: false as const,
		closed: false,
		book: { title: access.book.title, moderationMode: access.book.moderationMode },
		prefillName: access.invitePrefillName ?? '',
		lockName: Boolean(access.invitePrefillName),
		questions: questions.map((q) => ({
			id: q.id,
			label: q.label,
			section: q.section,
			fieldType: q.fieldType,
			required: q.required
		}))
	};
};

export const actions: Actions = {
	submit: async ({ request, params, cookies }) => {
		const { access, locked } = await loadBookAccess(params.token, cookies);
		if (locked) return fail(403, { message: 'Gesperrt.' });
		requireWrite(access);
		if (access.book.status !== 'open') {
			return fail(409, { message: 'Dieses Buch nimmt keine neuen Einträge mehr an.' });
		}

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

		if (!displayName) {
			return fail(400, {
				message: 'Bitte trag deinen Namen ein.',
				values: Object.fromEntries(fd)
			});
		}
		const missing = questions.find(
			(q) => q.required && !answers.find((a) => a.questionId === q.id)?.value
		);
		if (missing) {
			return fail(400, {
				message: `Bitte beantworte: „${missing.label}"`,
				values: Object.fromEntries(fd)
			});
		}

		// personalisierte Einladung: Kontingent prüfen
		if (access.inviteId) {
			const inv = await db.query.invite.findFirst({ where: eq(invite.id, access.inviteId) });
			if (inv && inv.maxEntries !== null && inv.usedCount >= inv.maxEntries) {
				return fail(409, { message: 'Über diese Einladung wurde bereits ein Eintrag erstellt.' });
			}
		}

		const published = access.book.moderationMode === 'instant';
		const editToken = newToken();

		await db.transaction(async (tx) => {
			if (access.inviteId) {
				await tx
					.update(invite)
					.set({ usedCount: sql`${invite.usedCount} + 1` })
					.where(eq(invite.id, access.inviteId));
			}

			const [maxRow] = await tx
				.select({ max: sql<number>`coalesce(max(${entry.position}), -1)` })
				.from(entry)
				.where(eq(entry.bookId, access.book.id));

			const [created] = await tx
				.insert(entry)
				.values({
					bookId: access.book.id,
					inviteId: access.inviteId ?? null,
					displayName,
					closingLine: closingLine || null,
					position: (maxRow?.max ?? -1) + 1,
					state: published ? 'published' : 'submitted',
					publishedAt: published ? new Date() : null,
					editTokenHash: hashToken(editToken),
					editScope: 'link'
				})
				.returning({ id: entry.id });

			const withValues = answers.filter((a) => a.value.length > 0);
			if (withValues.length) {
				await tx.insert(entryAnswer).values(
					withValues.map((a) => ({
						entryId: created.id,
						questionId: a.questionId,
						valueText: a.value
					}))
				);
			}
		});

		return {
			done: {
				published,
				editLink: `${ORIGIN}/b/${params.token}/eintrag/${editToken}`,
				readLink: `${ORIGIN}/b/${params.token}/lesen`
			}
		};
	}
};
