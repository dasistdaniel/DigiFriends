import type { Cookies } from '@sveltejs/kit';
import { createHmac } from 'node:crypto';
import { SECRET_PEPPER, OPERATOR_PASSWORD } from './env';
import { tokensEqual } from './crypto';

/**
 * Sitzung für den Betreiber-Bereich (/betreiber). Ein einzelnes, in der
 * Umgebung hinterlegtes Passwort statt eines Accounts – passend zum Rest
 * der App (keine Nutzerkonten). Nach Eingabe ein HMAC-Cookie als Nachweis,
 * analog zu den Link-Passwörtern in access.ts.
 */

const COOKIE_NAME = 'op_session';
const MAX_AGE = 60 * 60 * 12; // 12 Stunden

function proof(): string {
	return createHmac('sha256', SECRET_PEPPER).update('operator-session').digest('base64url');
}

export function operatorEnabled(): boolean {
	return OPERATOR_PASSWORD !== null;
}

export function verifyOperatorPassword(password: string): boolean {
	if (!OPERATOR_PASSWORD) return false;
	return tokensEqual(password, OPERATOR_PASSWORD);
}

export function markOperatorSession(cookies: Cookies): void {
	cookies.set(COOKIE_NAME, proof(), {
		path: '/betreiber',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: MAX_AGE
	});
}

export function isOperatorSession(cookies: Cookies): boolean {
	const got = cookies.get(COOKIE_NAME);
	return got !== undefined && tokensEqual(got, proof());
}

export function clearOperatorSession(cookies: Cookies): void {
	cookies.delete(COOKIE_NAME, { path: '/betreiber' });
}
