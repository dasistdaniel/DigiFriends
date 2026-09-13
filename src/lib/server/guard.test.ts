import { describe, expect, it } from 'vitest';
import { requireAdmin, requireWrite } from './guard';
import type { BookAccessResult, LinkRole } from './books';

function access(role: LinkRole): BookAccessResult {
	return {
		// Nur `role` wird von requireAdmin/requireWrite gelesen – der Rest ist
		// für den Typ nötig, aber für dieses Verhalten irrelevant.
		book: {} as BookAccessResult['book'],
		role,
		accessId: 'test-access-id',
		hasPassword: false
	};
}

describe('requireAdmin', () => {
	it('allows the admin role', () => {
		expect(() => requireAdmin(access('admin'))).not.toThrow();
	});

	it('rejects read and write roles with 403', () => {
		for (const role of ['read', 'write'] as const) {
			try {
				requireAdmin(access(role));
				expect.unreachable(`requireAdmin sollte bei role="${role}" werfen`);
			} catch (e) {
				expect((e as { status?: number }).status).toBe(403);
			}
		}
	});
});

describe('requireWrite', () => {
	it('allows admin and write roles', () => {
		expect(() => requireWrite(access('admin'))).not.toThrow();
		expect(() => requireWrite(access('write'))).not.toThrow();
	});

	it('rejects the read role with 403', () => {
		try {
			requireWrite(access('read'));
			expect.unreachable('requireWrite sollte bei role="read" werfen');
		} catch (e) {
			expect((e as { status?: number }).status).toBe(403);
		}
	});
});
