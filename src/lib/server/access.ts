import type { Cookies } from '@sveltejs/kit';
import { createHmac } from 'node:crypto';
import { SECRET_PEPPER } from './env';
import { tokensEqual } from './crypto';

/**
 * „Entsperrt"-Nachweis für passwortgeschützte Links. Nach korrekter
 * Passworteingabe wird ein HMAC-Cookie gesetzt, das nur belegt: „für diesen
 * Zugang wurde das Passwort schon einmal richtig eingegeben".
 */

const COOKIE_PREFIX = 'bk_';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 Tage

function proof(id: string): string {
	return createHmac('sha256', SECRET_PEPPER).update(`unlock:${id}`).digest('base64url');
}

export function markUnlocked(cookies: Cookies, id: string): void {
	cookies.set(COOKIE_PREFIX + id, proof(id), {
		path: '/b',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: MAX_AGE
	});
}

export function isUnlocked(cookies: Cookies, id: string): boolean {
	const got = cookies.get(COOKIE_PREFIX + id);
	return got !== undefined && tokensEqual(got, proof(id));
}

export function clearUnlocked(cookies: Cookies, id: string): void {
	cookies.delete(COOKIE_PREFIX + id, { path: '/b' });
}
