import { and, asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { entry } from '$lib/server/db/schema';
import { loadBookAccess } from '$lib/server/guard';
import { resolveBookThemeId } from '$lib/bookThemes';
import type { PageServerLoad } from './$types';

/** Fisher-Yates: pro Aufruf neu gemischt, damit die Galerie wirklich "wild durcheinander" wirkt. */
function shuffled<T>(items: T[]): T[] {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return { locked: true as const };

	const bookId = access.book.id;

	const entries = await db.query.entry.findMany({
		where: and(eq(entry.bookId, bookId), eq(entry.state, 'published')),
		orderBy: [asc(entry.position), asc(entry.publishedAt)],
		with: { answers: { with: { question: true } }, assets: true }
	});

	const assetBase = `/b/${params.token}/asset`;
	type Pos = { order?: number; rotate?: number };

	const mappedEntries = entries.map((e) => {
		const avatar = e.avatarAssetId ? e.assets.find((a) => a.id === e.avatarAssetId) : undefined;
		const byOrder = (a: (typeof e.assets)[number], b: (typeof e.assets)[number]) =>
			((a.position as Pos)?.order ?? 0) - ((b.position as Pos)?.order ?? 0);
		const drawings = e.assets.filter((a) => a.kind === 'drawing').sort(byOrder);
		const photos = e.assets.filter((a) => a.kind === 'photo').sort(byOrder);

		// Jeder Eintrag hat seine eigene (zufaellig gezogene) Fragenauswahl –
		// hier je nach Frage-Seite sortiert und auf beantwortete beschraenkt.
		const byQuestionOrder = (a: (typeof e.answers)[number], b: (typeof e.answers)[number]) =>
			a.question.position - b.question.position;
		const answered = e.answers.filter((a) => a.valueText.trim().length > 0);
		const leftAnswers = answered
			.filter((a) => a.question.section === 'left')
			.sort(byQuestionOrder)
			.map((a) => ({ label: a.question.label, value: a.valueText }));
		const rightAnswers = answered
			.filter((a) => a.question.section === 'right')
			.sort(byQuestionOrder)
			.map((a) => ({ label: a.question.label, value: a.valueText }));

		return {
			id: e.id,
			displayName: e.displayName || 'Anonym',
			closingLine: e.closingLine,
			leftAnswers,
			rightAnswers,
			avatar: avatar ? { thumb: `${assetBase}/${avatar.id}/thumb` } : null,
			drawings: drawings.map((d) => ({
				id: d.id,
				thumb: `${assetBase}/${d.id}/thumb`,
				full: `${assetBase}/${d.id}`,
				rotate: (d.position as Pos)?.rotate ?? 0
			})),
			photos: photos.map((p) => ({
				id: p.id,
				thumb: `${assetBase}/${p.id}/thumb`,
				full: `${assetBase}/${p.id}`,
				rotate: (p.position as Pos)?.rotate ?? 0
			}))
		};
	});

	// Galerie-Seiten am Ende: alle Zeichnungen & Fotos aus allen Einträgen, wild gemischt.
	const gallery = shuffled(
		mappedEntries.flatMap((e) => [
			...e.drawings.map((d) => ({
				id: d.id,
				thumb: d.thumb,
				full: d.full,
				rotate: d.rotate,
				alt: `Zeichnung von ${e.displayName}`
			})),
			...e.photos.map((p) => ({
				id: p.id,
				thumb: p.thumb,
				full: p.full,
				rotate: p.rotate,
				alt: `Foto von ${e.displayName}`
			}))
		])
	);

	return {
		locked: false as const,
		book: {
			title: access.book.title,
			subtitle: access.book.subtitle,
			introText: access.book.introText,
			theme: resolveBookThemeId((access.book.design as { theme?: unknown } | null)?.theme)
		},
		entries: mappedEntries,
		gallery
	};
};
