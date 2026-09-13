import { describe, expect, it } from 'vitest';
import { hashPassword, hashToken, newToken, tokensEqual, verifyPassword } from './crypto';

describe('newToken', () => {
	it('generates URL-safe, unique tokens', () => {
		const a = newToken();
		const b = newToken();
		expect(a).not.toBe(b);
		expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
	});

	it('scales length with the requested byte count', () => {
		expect(newToken(8).length).toBeLessThan(newToken(32).length);
	});
});

describe('hashToken', () => {
	it('is deterministic for the same input', () => {
		const token = newToken();
		expect(hashToken(token)).toBe(hashToken(token));
	});

	it('produces different hashes for different tokens', () => {
		expect(hashToken('token-a')).not.toBe(hashToken('token-b'));
	});

	it('returns a 64-character hex digest (HMAC-SHA256)', () => {
		expect(hashToken('anything')).toMatch(/^[0-9a-f]{64}$/);
	});
});

describe('tokensEqual', () => {
	it('is true for identical strings', () => {
		expect(tokensEqual('same-value', 'same-value')).toBe(true);
	});

	it('is false for different values of the same length', () => {
		expect(tokensEqual('aaaaaaaa', 'bbbbbbbb')).toBe(false);
	});

	it('is false for values of different length (no throw)', () => {
		expect(tokensEqual('short', 'a-lot-longer-value')).toBe(false);
	});

	it('is false for an empty vs. non-empty string', () => {
		expect(tokensEqual('', 'x')).toBe(false);
	});
});

describe('hashPassword / verifyPassword', () => {
	it('verifies the correct password and rejects a wrong one', async () => {
		const hash = await hashPassword('correct horse battery staple');
		await expect(verifyPassword(hash, 'correct horse battery staple')).resolves.toBe(true);
		await expect(verifyPassword(hash, 'wrong password')).resolves.toBe(false);
	});

	it('never stores the password in plain text', async () => {
		const hash = await hashPassword('geheim123');
		expect(hash).not.toContain('geheim123');
	});

	it('salts each hash differently', async () => {
		const [a, b] = await Promise.all([
			hashPassword('same-password'),
			hashPassword('same-password')
		]);
		expect(a).not.toBe(b);
	});

	it('verifyPassword resolves false instead of throwing on a malformed hash', async () => {
		await expect(verifyPassword('not-a-real-argon2-hash', 'irrelevant')).resolves.toBe(false);
	});
});
