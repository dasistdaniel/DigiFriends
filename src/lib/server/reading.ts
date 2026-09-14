import { and, asc, eq } from 'drizzle-orm';
import { db } from './db';
import { entry } from './db/schema';
import { resolveBookThemeId } from '$lib/bookThemes';
import type { BookAccessResult } from './books';

/** Fisher-Yates: pro Aufruf neu gemischt, damit die Galerie wirklich "wild durcheinander" wirkt. */
function shuffled<T>(items: T[]): T[] {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

/**
 * Gemeinsame Datenaufbereitung für die Leseansicht: veröffentlichte
 * Einträge mit je eigener Fragenauswahl (siehe pickBySection in /schreiben),
 * plus die gemischte Galerie. Genutzt von /lesen (interaktives Buch) und
 * /lesen/drucken (Druck-/PDF-Export).
 */
export async function loadBookForReading(access: BookAccessResult, assetBase: string) {
	const bookId = access.book.id;

	const entries = await db.query.entry.findMany({
		where: and(eq(entry.bookId, bookId), eq(entry.state, 'published')),
		orderBy: [asc(entry.position), asc(entry.publishedAt)],
		with: { answers: { with: { question: true } }, assets: true }
	});

	type Pos = { order?: number; rotate?: number };

	const mappedEntries = entries.map((e) => {
		const avatar = e.avatarAssetId ? e.assets.find((a) => a.id === e.avatarAssetId) : undefined;
		const byOrder = (a: (typeof e.assets)[number], b: (typeof e.assets)[number]) =>
			((a.position as Pos)?.order ?? 0) - ((b.position as Pos)?.order ?? 0);
		const drawings = e.assets.filter((a) => a.kind === 'drawing').sort(byOrder);
		const photos = e.assets.filter((a) => a.kind === 'photo').sort(byOrder);

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
		book: {
			title: access.book.title,
			subtitle: access.book.subtitle,
			introText: access.book.introText,
			theme: resolveBookThemeId((access.book.design as { theme?: unknown } | null)?.theme)
		},
		entries: mappedEntries,
		gallery
	};
}
