/**
 * Fragen-Vorlagen. Jede Vorlage ist ein größerer Fragen-Pool je Seite
 * (links/rechts); der volle Pool landet im Buch. Wer einen Eintrag schreibt,
 * bekommt daraus eine eigene zufällige Auswahl (siehe pickBySection, benutzt
 * in /schreiben) – so unterscheidet sich jede Seite im Buch. Nach dem
 * Anlegen ist jede Frage pro Buch weiterhin frei editierbar (§06).
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
	/** Kandidaten-Pool, aus dem beim Anlegen zufällig gezogen wird. */
	questions: TemplateQuestion[];
	/** Wie viele Fragen je Seite beim Anlegen gezogen werden. */
	pick: { left: number; right: number };
};

export const templates: Template[] = [
	{
		id: 'erwachsene',
		name: 'Erwachsene / Freundschaft',
		description: 'Der Fragensatz aus dem Mockup – warm, persönlich, ein bisschen albern.',
		pick: { left: 4, right: 4 },
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
			{ label: 'Was war dein erster Eindruck von mir?', fieldType: 'long', section: 'left' },
			{
				label: 'Die verrückteste Sache, die wir zusammen gemacht haben',
				fieldType: 'long',
				section: 'left'
			},
			{ label: 'Ein Insider, den nur wir beide verstehen', fieldType: 'short', section: 'left' },
			{
				label: 'Der Moment, in dem ich wusste, dass wir Freunde bleiben',
				fieldType: 'long',
				section: 'left'
			},
			{
				label: 'Was würde ich niemals mit jemand anderem machen außer mit dir?',
				fieldType: 'long',
				section: 'left'
			},
			{
				label: 'So würde ich dich in drei Worten beschreiben',
				fieldType: 'short',
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
			},
			{
				label: 'Was soll sich für dich im nächsten Jahr ändern?',
				fieldType: 'long',
				section: 'right'
			},
			{ label: 'Ein Rat, den ich dir mit auf den Weg gebe', fieldType: 'long', section: 'right' },
			{
				label: 'Was mache ich, das dich garantiert zum Lachen bringt?',
				fieldType: 'short',
				section: 'right'
			},
			{ label: 'Wo sehe ich dich in zehn Jahren?', fieldType: 'long', section: 'right' },
			{
				label: 'Das Erste, was mir einfällt, wenn ich an dich denke',
				fieldType: 'short',
				section: 'right'
			},
			{ label: 'Was wünsche ich mir für unsere Freundschaft?', fieldType: 'long', section: 'right' }
		]
	},
	{
		id: 'klassik',
		name: 'Klassik / Kindheit',
		description: 'Das klassische Freundebuch-Steckbrief-Gefühl.',
		pick: { left: 5, right: 4 },
		questions: [
			{ label: 'Spitzname', fieldType: 'short', section: 'left' },
			{ label: 'Geburtstag', fieldType: 'date', section: 'left' },
			{ label: 'Lieblingsfarbe', fieldType: 'short', section: 'left' },
			{ label: 'Lieblingsessen', fieldType: 'short', section: 'left' },
			{ label: 'Das mag ich gar nicht', fieldType: 'short', section: 'left' },
			{ label: 'Lieblingstier', fieldType: 'short', section: 'left' },
			{ label: 'Lieblingsfach in der Schule', fieldType: 'short', section: 'left' },
			{ label: 'Lieblingsserie oder -film', fieldType: 'short', section: 'left' },
			{ label: 'Meine beste Freundin / mein bester Freund', fieldType: 'short', section: 'left' },
			{ label: 'Lieblingsort', fieldType: 'short', section: 'left' },
			{ label: 'Meine Lieblingsmusik', fieldType: 'short', section: 'left' },
			{ label: 'Hobbys', fieldType: 'long', section: 'right' },
			{ label: 'Das will ich später werden', fieldType: 'short', section: 'right' },
			{ label: 'Mein größter Wunsch', fieldType: 'long', section: 'right' },
			{ label: 'Das wünsche ich dir', fieldType: 'long', section: 'right' },
			{ label: 'Meine größte Angst', fieldType: 'short', section: 'right' },
			{ label: 'Das kann ich richtig gut', fieldType: 'short', section: 'right' },
			{ label: 'Darüber lache ich am meisten', fieldType: 'long', section: 'right' },
			{ label: 'Mein Traumurlaub', fieldType: 'short', section: 'right' },
			{ label: 'Das würde ich gerne mal ausprobieren', fieldType: 'long', section: 'right' }
		]
	},
	{
		id: 'abschied-kollegin',
		name: 'Abschied Kolleg:in',
		description: 'Für den letzten Arbeitstag – Erinnerungen und gute Wünsche.',
		pick: { left: 3, right: 3 },
		questions: [
			{ label: 'So haben wir zusammengearbeitet', fieldType: 'long', section: 'left' },
			{ label: 'Ein Moment, den ich nicht vergesse', fieldType: 'long', section: 'left' },
			{ label: 'Das konntest du besonders gut', fieldType: 'long', section: 'left' },
			{ label: 'Der lustigste Moment im Büro mit dir', fieldType: 'long', section: 'left' },
			{ label: 'Was ich von dir gelernt habe', fieldType: 'long', section: 'left' },
			{ label: 'Meine erste Erinnerung an dich', fieldType: 'long', section: 'left' },
			{ label: 'Das hat mich an dir überrascht', fieldType: 'short', section: 'left' },
			{ label: 'Das werde ich vermissen', fieldType: 'long', section: 'right' },
			{ label: 'Für deinen nächsten Schritt wünsche ich dir', fieldType: 'long', section: 'right' },
			{
				label: 'Bleiben wir in Kontakt? So erreichst du mich',
				fieldType: 'short',
				section: 'right'
			},
			{ label: 'Mein Rat für deine neue Stelle', fieldType: 'long', section: 'right' },
			{ label: 'Das solltest du dir unbedingt bewahren', fieldType: 'short', section: 'right' },
			{ label: 'Der Spruch, den ich dir mitgebe', fieldType: 'short', section: 'right' }
		]
	},
	{
		id: 'hochzeit',
		name: 'Hochzeit / Gästebuch',
		description: 'Eine Seite pro Gast statt loser Zettel.',
		pick: { left: 2, right: 3 },
		questions: [
			{ label: 'So kenne ich euch', fieldType: 'long', section: 'left' },
			{ label: 'Mein schönster gemeinsamer Moment mit euch', fieldType: 'long', section: 'left' },
			{
				label: 'Wie ich erfahren habe, dass ihr ein Paar seid',
				fieldType: 'long',
				section: 'left'
			},
			{
				label: 'Der Moment, in dem mir klar wurde, dass ihr füreinander bestimmt seid',
				fieldType: 'long',
				section: 'left'
			},
			{ label: 'Meine Lieblingserinnerung an euch als Paar', fieldType: 'long', section: 'left' },
			{ label: 'Mein Tipp für eure Ehe', fieldType: 'long', section: 'right' },
			{ label: 'Das wünsche ich euch von Herzen', fieldType: 'long', section: 'right' },
			{
				label: 'Ein Ort, den ihr unbedingt zusammen besuchen solltet',
				fieldType: 'short',
				section: 'right'
			},
			{
				label: 'Das Geheimnis einer glücklichen Beziehung, aus meiner Sicht',
				fieldType: 'long',
				section: 'right'
			},
			{
				label: 'Worauf ich mich bei eurer Zukunft am meisten freue',
				fieldType: 'short',
				section: 'right'
			},
			{ label: 'Ein Toast auf euch, in einem Satz', fieldType: 'short', section: 'right' }
		]
	},
	{
		id: 'reise',
		name: 'Reise / Abenteuer',
		description: 'Für Reisegruppen, WGs auf Zeit oder eine gemeinsame Tour.',
		pick: { left: 3, right: 3 },
		questions: [
			{ label: 'Mein Highlight dieser Reise', fieldType: 'long', section: 'left' },
			{ label: 'Der peinlichste Moment unterwegs', fieldType: 'long', section: 'left' },
			{ label: 'Das beste Essen, das wir hatten', fieldType: 'short', section: 'left' },
			{
				label: 'Der schönste Ausblick, den wir gesehen haben',
				fieldType: 'short',
				section: 'left'
			},
			{
				label: 'Das Verrückteste, was uns unterwegs passiert ist',
				fieldType: 'long',
				section: 'left'
			},
			{ label: 'Mein Lieblingsfoto von dieser Reise', fieldType: 'short', section: 'left' },
			{
				label: 'Was ich nie erwartet hätte, dass es passiert',
				fieldType: 'long',
				section: 'right'
			},
			{ label: 'Wohin sollten wir als Nächstes reisen?', fieldType: 'short', section: 'right' },
			{ label: 'Das nehme ich aus dieser Reise mit', fieldType: 'long', section: 'right' },
			{
				label: 'Das würde ich beim nächsten Mal anders machen',
				fieldType: 'long',
				section: 'right'
			},
			{
				label: 'Das habe ich über dich als Reisebegleitung gelernt',
				fieldType: 'short',
				section: 'right'
			}
		]
	},
	{
		id: 'verein-team',
		name: 'Verein / Team',
		description: 'Für Sportteams, Vereine oder Kolleg:innen einer Saison/eines Projekts.',
		pick: { left: 3, right: 3 },
		questions: [
			{ label: 'Mein erster Eindruck vom Team', fieldType: 'long', section: 'left' },
			{ label: 'Unser bestes gemeinsames Erlebnis', fieldType: 'long', section: 'left' },
			{ label: 'Mein Spitzname in der Gruppe', fieldType: 'short', section: 'left' },
			{
				label: 'Der lustigste Moment beim Training oder Treffen',
				fieldType: 'long',
				section: 'left'
			},
			{ label: 'Das hat mich am meisten überrascht am Team', fieldType: 'short', section: 'left' },
			{ label: 'Das mache ich, wenn ich nicht hier bin', fieldType: 'short', section: 'right' },
			{ label: 'Was ich dem Team wünsche', fieldType: 'long', section: 'right' },
			{
				label: 'Eine Regel, die wir uns ausgedacht haben (und warum)',
				fieldType: 'long',
				section: 'right'
			},
			{ label: 'Mein Wunsch für die nächste Saison', fieldType: 'short', section: 'right' },
			{ label: 'Das schätze ich an diesem Team am meisten', fieldType: 'long', section: 'right' }
		]
	},
	{
		id: 'schraeg',
		name: 'Ungewöhnlich & schräg',
		description: 'Für alle, die lieber schmunzeln statt schwelgen wollen.',
		pick: { left: 4, right: 4 },
		questions: [
			{
				label: 'Welches Küchengerät wärst du, und warum genau dieses?',
				fieldType: 'long',
				section: 'left'
			},
			{
				label: 'Die schlechteste Ausrede, die dir je jemand geglaubt hat',
				fieldType: 'long',
				section: 'left'
			},
			{
				label: 'Ein Talent, das dir niemand zutraut',
				fieldType: 'short',
				section: 'left'
			},
			{
				label: 'Wenn unsere Freundschaft ein Geräusch wäre, welches?',
				fieldType: 'short',
				section: 'left'
			},
			{ label: 'Wenn du ein Emoji wärst, welches und warum?', fieldType: 'short', section: 'left' },
			{
				label: 'Deine Superkraft, wenn sie völlig nutzlos sein müsste',
				fieldType: 'long',
				section: 'left'
			},
			{
				label: 'Das unnötigste Wissen, das du mit mir teilst',
				fieldType: 'long',
				section: 'left'
			},
			{ label: 'Dein Geheim-Talent, das noch niemand kennt', fieldType: 'short', section: 'left' },
			{
				label: 'Die verrückteste Verschwörungstheorie, die du dir gerade ausdenkst',
				fieldType: 'long',
				section: 'right'
			},
			{
				label: 'Dein Motto, falls du morgen Bürgermeister:in würdest',
				fieldType: 'long',
				section: 'right'
			},
			{
				label: 'Auf einer Skala von Toaster bis Weltraumrakete: wie kompliziert bist du?',
				fieldType: 'short',
				section: 'right'
			},
			{
				label: 'Letzte Worte, bevor die Erde explodiert',
				fieldType: 'short',
				section: 'right'
			},
			{ label: 'Dein Plan, falls morgen Zombies auftauchen', fieldType: 'long', section: 'right' },
			{
				label: 'Das seltsamste Kompliment, das du je bekommen hast',
				fieldType: 'short',
				section: 'right'
			},
			{ label: 'Wenn du ein Gericht wärst, welches?', fieldType: 'short', section: 'right' },
			{
				label: 'Dein Motto für ein Leben in völliger Absurdität',
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

function shuffled<T>(items: T[]): T[] {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

/**
 * Zieht eine zufällige Auswahl aus einem Fragen-Pool (je Sektion `count.left`/
 * `count.right` Fragen; als required markierte Fragen sind immer dabei).
 * Generisch über TemplateQuestion und die DB-Question-Zeile nutzbar – jede
 * Person, die in ein Buch schreibt, bekommt so ihre eigene Ziehung aus dem
 * Buch-Fragenpool vorgelegt (siehe /schreiben load).
 */
export function pickBySection<T extends { section: 'left' | 'right'; required?: boolean | null }>(
	pool: T[],
	count: { left: number; right: number }
): T[] {
	function pickSection(section: 'left' | 'right', n: number): T[] {
		const items = pool.filter((q) => q.section === section);
		const required = items.filter((q) => q.required);
		const optional = shuffled(items.filter((q) => !q.required));
		const need = Math.max(0, n - required.length);
		return [...required, ...optional.slice(0, need)];
	}
	return [...pickSection('left', count.left), ...pickSection('right', count.right)];
}
