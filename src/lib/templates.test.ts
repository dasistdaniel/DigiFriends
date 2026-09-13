import { describe, expect, it } from 'vitest';
import { defaultTemplateId, getTemplate, templates } from './templates';

describe('templates', () => {
	it('has unique ids', () => {
		const ids = templates.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('gives every template at least one question', () => {
		for (const t of templates) {
			expect(t.questions.length).toBeGreaterThan(0);
		}
	});

	it('defaultTemplateId points at a real template', () => {
		expect(getTemplate(defaultTemplateId)).toBeDefined();
	});
});

describe('getTemplate', () => {
	it('finds a template by id', () => {
		expect(getTemplate(templates[0].id)?.id).toBe(templates[0].id);
	});

	it('returns undefined for an unknown id', () => {
		expect(getTemplate('does-not-exist')).toBeUndefined();
	});
});
