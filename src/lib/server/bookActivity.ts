/**
 * Letzte Aktivitaet eines Buchs: die Buch-Einstellungen selbst oder
 * irgendein Eintrag, je nachdem was spaeter war. Reiner Hinweis fuer den
 * Betreiber-Bereich (siehe /betreiber) - keine automatische Loeschung.
 */
export function computeBookActivity(
	bookUpdatedAt: Date,
	entryUpdatedAts: Date[],
	inactiveAfterDays: number,
	now: number = Date.now()
): { lastActivityAt: Date; inactive: boolean } {
	const lastActivityAt = entryUpdatedAts.reduce(
		(latest, t) => (t > latest ? t : latest),
		bookUpdatedAt
	);
	const inactiveDays = Math.floor((now - lastActivityAt.getTime()) / (24 * 60 * 60 * 1000));
	return { lastActivityAt, inactive: inactiveDays >= inactiveAfterDays };
}
