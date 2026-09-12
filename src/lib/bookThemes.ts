/**
 * Optische Themes für den Bucheinband und die Seitenakzente.
 * Ausgewählt im Admin-Bereich (book.design.theme), angewendet über
 * data-book-theme in Book.svelte.
 */

export type BookTheme = {
	id: string;
	name: string;
	description: string;
	/** Vorschaufarben für die Auswahlkarte im Admin-Bereich. */
	swatch: [string, string];
};

export const bookThemes: BookTheme[] = [
	{
		id: 'klassisch',
		name: 'Klassisch',
		description: 'Warmes Leder – der ursprüngliche Look.',
		swatch: ['#56311f', '#3a2015']
	},
	{
		id: 'regenbogen',
		name: 'Regenbogen',
		description: 'Bunt und fröhlich, in sechs Farben.',
		swatch: ['#e63950', '#2f80ed']
	},
	{
		id: 'ozean',
		name: 'Ozean',
		description: 'Frisches Petrolblau, modern und klar.',
		swatch: ['#1f6f78', '#123b42']
	},
	{
		id: 'mitternacht',
		name: 'Mitternacht',
		description: 'Dunkles Blau mit Gold – edel und ruhig.',
		swatch: ['#1b2340', '#0a0e1f']
	}
];

export const defaultBookThemeId = bookThemes[0].id;

export function isBookThemeId(id: unknown): id is string {
	return typeof id === 'string' && bookThemes.some((t) => t.id === id);
}

export function resolveBookThemeId(id: unknown): string {
	return isBookThemeId(id) ? id : defaultBookThemeId;
}
