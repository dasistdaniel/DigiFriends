import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { hash as argonHash, verify as argonVerify } from '@node-rs/argon2';
import { SECRET_PEPPER } from './env';

/**
 * Link-Tokens: ~192 Bit Zufall, URL-sicher. Der Klartext steht nur im Link;
 * gespeichert wird ausschließlich der HMAC-Hash (schnell für Lookups).
 */
export function newToken(bytes = 24): string {
	return randomBytes(bytes).toString('base64url');
}

export function hashToken(token: string): string {
	return createHmac('sha256', SECRET_PEPPER).update(token).digest('hex');
}

export function tokensEqual(a: string, b: string): boolean {
	const ba = Buffer.from(a);
	const bb = Buffer.from(b);
	return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Passwörter (optional pro Link): Argon2id. */
export function hashPassword(password: string): Promise<string> {
	return argonHash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
	try {
		return await argonVerify(hash, password);
	} catch {
		return false;
	}
}
