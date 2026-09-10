import { env } from '$env/dynamic/private';

/** Zentrale, typisierte Sicht auf die Umgebungsvariablen. */

export const SECRET_PEPPER = env.SECRET_PEPPER?.trim() || 'dev-only-change-me';

/** Bücher anlegen: 'open' = für alle, 'closed' = gesperrt. */
export const SIGNUP_MODE: 'open' | 'closed' = env.SIGNUP_MODE === 'closed' ? 'closed' : 'open';

/** Öffentliche Basis-URL für generierte Links (ohne abschließenden Slash). */
export const ORIGIN = (env.ORIGIN?.trim() || 'http://localhost:5173').replace(/\/$/, '');

/** Mailversand ist nur aktiv, wenn eine SMTP-URL gesetzt ist. */
export const SMTP_URL = env.SMTP_URL?.trim() || null;
export const MAIL_FROM = env.MAIL_FROM?.trim() || 'Freundebuch <noreply@example.com>';
export const MAIL_ENABLED = SMTP_URL !== null;

if (SECRET_PEPPER === 'dev-only-change-me' && process.env.NODE_ENV === 'production') {
	console.warn(
		'[digifriends] SECRET_PEPPER ist nicht gesetzt – bitte in Produktion konfigurieren.'
	);
}
