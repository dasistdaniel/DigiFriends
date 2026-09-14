import { env } from '$env/dynamic/private';

/** Zentrale, typisierte Sicht auf die Umgebungsvariablen. */

export const SECRET_PEPPER = env.SECRET_PEPPER?.trim() || 'dev-only-change-me';

/** Bücher anlegen: 'open' = für alle, 'closed' = gesperrt. */
export const SIGNUP_MODE: 'open' | 'closed' = env.SIGNUP_MODE === 'closed' ? 'closed' : 'open';

/** Öffentliche Basis-URL für generierte Links (ohne abschließenden Slash). */
export const ORIGIN = (env.ORIGIN?.trim() || 'http://localhost:5173').replace(/\/$/, '');

/** Verzeichnis für hochgeladene Bilder (in Produktion ein Docker-Volume). */
export const UPLOAD_DIR = env.UPLOAD_DIR?.trim() || '.uploads';

/** Maximale Uploadgröße je Bild. */
export const MAX_UPLOAD_BYTES = Number(env.MAX_UPLOAD_BYTES) || 8 * 1024 * 1024;

/** Obergrenzen je Eintrag (Bild-Auswahl in der UI hat entsprechend 4 feste Plaetze). */
export const MAX_PHOTOS_PER_ENTRY = Number(env.MAX_PHOTOS_PER_ENTRY) || 4;
export const MAX_DRAWINGS_PER_ENTRY = Number(env.MAX_DRAWINGS_PER_ENTRY) || 4;

/** Passwort für den Betreiber-Bereich (/betreiber). Ohne gesetztes Passwort deaktiviert. */
export const OPERATOR_PASSWORD = env.OPERATOR_PASSWORD?.trim() || null;

/**
 * Ab wann ein Buch im Betreiber-Bereich als inaktiv markiert wird (reiner
 * Hinweis, keine automatische Löschung – die entscheidet der Betreiber selbst).
 */
export const INACTIVE_AFTER_DAYS = Number(env.INACTIVE_AFTER_DAYS) || 365;

/** Mailversand ist nur aktiv, wenn eine SMTP-URL gesetzt ist. */
export const SMTP_URL = env.SMTP_URL?.trim() || null;
export const MAIL_FROM = env.MAIL_FROM?.trim() || 'Freundebuch <noreply@example.com>';
export const MAIL_ENABLED = SMTP_URL !== null;

if (SECRET_PEPPER === 'dev-only-change-me' && process.env.NODE_ENV === 'production') {
	console.warn(
		'[digifriends] SECRET_PEPPER ist nicht gesetzt – bitte in Produktion konfigurieren.'
	);
}
