import { describe, expect, it } from 'vitest';
import { rateLimit } from './rateLimit';

describe('rateLimit', () => {
	it('allows calls up to the limit and blocks the next one', () => {
		const key = `test-${Math.random()}`;
		const opts = { limit: 3, windowMs: 60_000 };

		expect(rateLimit(key, opts)).toBe(true);
		expect(rateLimit(key, opts)).toBe(true);
		expect(rateLimit(key, opts)).toBe(true);
		expect(rateLimit(key, opts)).toBe(false);
		expect(rateLimit(key, opts)).toBe(false);
	});

	it('keeps separate keys independent', () => {
		const a = `test-a-${Math.random()}`;
		const b = `test-b-${Math.random()}`;
		const opts = { limit: 1, windowMs: 60_000 };

		expect(rateLimit(a, opts)).toBe(true);
		expect(rateLimit(b, opts)).toBe(true);
		expect(rateLimit(a, opts)).toBe(false);
		expect(rateLimit(b, opts)).toBe(false);
	});

	it('resets once the window has passed', () => {
		const key = `test-reset-${Math.random()}`;

		expect(rateLimit(key, { limit: 1, windowMs: 10 })).toBe(true);
		expect(rateLimit(key, { limit: 1, windowMs: 10 })).toBe(false);

		return new Promise<void>((resolve) => {
			setTimeout(() => {
				expect(rateLimit(key, { limit: 1, windowMs: 10 })).toBe(true);
				resolve();
			}, 20);
		});
	});
});
