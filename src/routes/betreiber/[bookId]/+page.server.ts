import { error, fail } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { book, bookAccess, entry, invite, question } from '$lib/server/db/schema';
import { hashToken, newToken } from '$lib/server/crypto';
import { logAudit } from '$lib/server/audit';
import { ORIGIN } from '$lib/server/env';
import { isOperatorSession, operatorEnabled } from '$lib/server/operator';
import type { Actions, PageServerLoad } from './$types';

const viewPath: Record<string, string> = { admin: 'admin', read: 'lesen', write: 'schreiben' };
const stateLabel: Record<string, string> = {
	published: 'Sichtbar',
	hidden: 'Verborgen',
	submitted: 'Wartet auf Freigabe',
	draft: 'Entwurf'
};

type Pos = { order?: number };

export const load: PageServerLoad = async ({ params, cookies }) => {
	if (!operatorEnabled() || !isOperatorSession(cookies)) error(403, 'Kein Zugriff.');

	const b = await db.query.book.findFirst({ where: eq(book.id, params.bookId) });
	if (!b) error(404, 'Buch nicht gefunden.');

	const [questions, entries] = await Promise.all([
		db.query.question.findMany({
			where: eq(question.bookId, b.id),
			orderBy: asc(question.position)
		}),
		db.query.entry.findMany({
			where: eq(entry.bookId, b.id),
			orderBy: [asc(entry.position), asc(entry.createdAt)],
			with: { answers: true, assets: true }
		})
	]);

	const assetBase = `/betreiber/${b.id}/asset`;

	return {
		book: {
			id: b.id,
			title: b.title,
			subtitle: b.subtitle,
			suspended: b.suspendedAt !== null
		},
		entries: entries.map((e) => {
			const avatar = e.avatarAssetId ? e.assets.find((a) => a.id === e.avatarAssetId) : undefined;
			const byOrder = (a: (typeof e.assets)[number], c: (typeof e.assets)[number]) =>
				((a.position as Pos)?.order ?? 0) - ((c.position as Pos)?.order ?? 0);
			const drawings = e.assets.filter((a) => a.kind === 'drawing').sort(byOrder);
			const photos = e.assets.filter((a) => a.kind === 'photo').sort(byOrder);
			return {
				id: e.id,
				displayName: e.displayName || 'Anonym',
				state: e.state,
				stateLabel: stateLabel[e.state] ?? e.state,
				closingLine: e.closingLine,
				answers: questions
					.map((q) => ({
						label: q.label,
						value: e.answers.find((a) => a.questionId === q.id)?.valueText ?? ''
					}))
					.filter((a) => a.value !== ''),
				avatar: avatar ? `${assetBase}/${avatar.id}/thumb` : null,
				drawings: drawings.map((d) => ({ id: d.id, thumb: `${assetBase}/${d.id}/thumb` })),
				photos: photos.map((p) => ({ id: p.id, thumb: `${assetBase}/${p.id}/thumb` }))
			};
		})
	};
};

export const actions: Actions = {
	regenerateLink: async ({ request, params, cookies }) => {
		if (!operatorEnabled() || !isOperatorSession(cookies)) return fail(403);

		const role = String((await request.formData()).get('role') ?? '');
		if (!['admin', 'read', 'write'].includes(role)) return fail(400);

		const token = newToken();
		if (role === 'write') {
			await db
				.update(invite)
				.set({ tokenHash: hashToken(token) })
				.where(and(eq(invite.bookId, params.bookId), eq(invite.kind, 'open')));
		} else {
			await db
				.update(bookAccess)
				.set({ tokenHash: hashToken(token) })
				.where(
					and(eq(bookAccess.bookId, params.bookId), eq(bookAccess.role, role as 'admin' | 'read'))
				);
		}

		const b = await db.query.book.findFirst({
			where: eq(book.id, params.bookId),
			columns: { title: true }
		});
		await logAudit({
			bookId: params.bookId,
			actorRole: 'operator',
			action: 'access.regenerate',
			meta: { role, bookTitle: b?.title }
		});

		return { newLink: { role, url: `${ORIGIN}/b/${token}/${viewPath[role]}` } };
	}
};
