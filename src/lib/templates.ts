/**
 * Fragen-Vorlagen. Beim Anlegen wählt der Admin eine Vorlage; danach ist jede
 * Frage pro Buch voll editierbar (siehe KONZEPT.md §06).
 */

export type TemplateQuestion = {
	label: string;
	fieldType: 'short' | 'long' | 'date';
	section: 'left' | 'right';
	required?: boolean;
};

export type Template = {
	id: string;
	name: string;
	description: string;
	questions: TemplateQuestion[];
};

export const templates: Template[] = [
	{
		id: 'erwachsene',
		name: 'Erwachsene / Freundschaft',
		description: 'Der Fragensatz aus dem Mockup – warm, persönlich, ein bisschen albern.',
		questions: [
			{ label: 'Wie haben wir uns kennengelernt?', fieldType: 'long', section: 'left' },
			{ label: 'Unser lustigster gemeinsamer Moment', fieldType: 'long', section: 'left' },
			{
				label: 'Wenn du ein Tier wärst, welches wäre es und warum?',
				fieldType: 'long',
				section: 'left'
			},
			{
				label: 'Meine schönste Erinnerung an einen gemeinsamen Ausflug',
				fieldType: 'long',
				section: 'left'
			},
			{ label: 'Meine Wünsche für dich', fieldType: 'long', section: 'right' },
			{ label: 'Mein Lieblingszitat oder Lebensmotto', fieldType: 'long', section: 'right' },
			{
				label: 'Eine Eigenschaft, die ich von dir lernen möchte',
				fieldType: 'short',
				section: 'right'
			},
			{
				label: 'Wenn du im Lotto gewinnst, wohin reisen wir?',
				fieldType: 'short',
				section: 'right'
			}
		]
	},
	{
		id: 'klassik',
		name: 'Klassik / Kindheit',
		description: 'Das klassische Freundebuch-Steckbrief-Gefühl.',
		questions: [
			{ label: 'Spitzname', fieldType: 'short', section: 'left' },
			{ label: 'Geburtstag', fieldType: 'date', section: 'left' },
			{ label: 'Lieblingsfarbe', fieldType: 'short', section: 'left' },
			{ label: 'Lieblingsessen', fieldType: 'short', section: 'left' },
			{ label: 'Das mag ich gar nicht', fieldType: 'short', section: 'left' },
			{ label: 'Hobbys', fieldType: 'long', section: 'right' },
			{ label: 'Das will ich später werden', fieldType: 'short', section: 'right' },
			{ label: 'Mein größter Wunsch', fieldType: 'long', section: 'right' },
			{ label: 'Das wünsche ich dir', fieldType: 'long', section: 'right' }
		]
	},
	{
		id: 'abschied-kollegin',
		name: 'Abschied Kolleg:in',
		description: 'Für den letzten Arbeitstag – Erinnerungen und gute Wünsche.',
		questions: [
			{ label: 'So haben wir zusammengearbeitet', fieldType: 'long', section: 'left' },
			{ label: 'Ein Moment, den ich nicht vergesse', fieldType: 'long', section: 'left' },
			{ label: 'Das konntest du besonders gut', fieldType: 'long', section: 'left' },
			{ label: 'Das werde ich vermissen', fieldType: 'long', section: 'right' },
			{ label: 'Für deinen nächsten Schritt wünsche ich dir', fieldType: 'long', section: 'right' },
			{
				label: 'Bleiben wir in Kontakt? So erreichst du mich',
				fieldType: 'short',
				section: 'right'
			}
		]
	},
	{
		id: 'hochzeit',
		name: 'Hochzeit / Gästebuch',
		description: 'Eine Seite pro Gast statt loser Zettel.',
		questions: [
			{ label: 'So kenne ich euch', fieldType: 'long', section: 'left' },
			{ label: 'Mein schönster gemeinsamer Moment mit euch', fieldType: 'long', section: 'left' },
			{ label: 'Mein Tipp für eure Ehe', fieldType: 'long', section: 'right' },
			{ label: 'Das wünsche ich euch von Herzen', fieldType: 'long', section: 'right' },
			{
				label: 'Ein Ort, den ihr unbedingt zusammen besuchen solltet',
				fieldType: 'short',
				section: 'right'
			}
		]
	}
];

export function getTemplate(id: string): Template | undefined {
	return templates.find((t) => t.id === id);
}

export const defaultTemplateId = templates[0].id;
