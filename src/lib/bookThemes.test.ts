import { describe, expect, it } from 'vitest';
import { bookThemes, defaultBookThemeId, isBookThemeId, resolveBookThemeId } from './bookThemes';

describe('isBookThemeId', () => {
	it('accepts every real theme id', () => {
		for (const t of bookThemes) {
			expect(isBookThemeId(t.id)).toBe(true);
		}
	});

	it('rejects unknown or non-string values', () => {
		expect(isBookThemeId('unbekannt')).toBe(false);
		expect(isBookThemeId(undefined)).toBe(false);
		expect(isBookThemeId(null)).toBe(false);
		expect(isBookThemeId(42)).toBe(false);
	});
});

describe('resolveBookThemeId', () => {
	it('passes through a valid theme id', () => {
		const someTheme = bookThemes[bookThemes.length - 1].id;
		expect(resolveBookThemeId(someTheme)).toBe(someTheme);
	});

	it('falls back to the default for invalid input', () => {
		expect(resolveBookThemeId('unbekannt')).toBe(defaultBookThemeId);
		expect(resolveBookThemeId(undefined)).toBe(defaultBookThemeId);
	});
});
