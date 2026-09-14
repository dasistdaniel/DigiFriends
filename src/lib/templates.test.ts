import { describe, expect, it } from 'vitest';
import {
	defaultTemplateId,
	getTemplate,
	pickTemplateQuestions,
	templates,
	type Template
} from './templates';

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

	it('has a large enough pool per section to satisfy its own pick counts', () => {
		for (const t of templates) {
			const left = t.questions.filter((q) => q.section === 'left').length;
			const right = t.questions.filter((q) => q.section === 'right').length;
			expect(left, `${t.id}: left pool`).toBeGreaterThanOrEqual(t.pick.left);
			expect(right, `${t.id}: right pool`).toBeGreaterThanOrEqual(t.pick.right);
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

describe('pickTemplateQuestions', () => {
	it('picks exactly pick.left + pick.right questions, split by section, for every template', () => {
		for (const t of templates) {
			const picked = pickTemplateQuestions(t);
			expect(picked.filter((q) => q.section === 'left').length).toBe(t.pick.left);
			expect(picked.filter((q) => q.section === 'right').length).toBe(t.pick.right);
		}
	});

	it('never picks the same question twice', () => {
		for (const t of templates) {
			const labels = pickTemplateQuestions(t).map((q) => q.label);
			expect(new Set(labels).size).toBe(labels.length);
		}
	});

	it('only picks questions that exist in the pool', () => {
		for (const t of templates) {
			const pool = new Set(t.questions.map((q) => q.label));
			for (const q of pickTemplateQuestions(t)) {
				expect(pool.has(q.label)).toBe(true);
			}
		}
	});

	it('always includes required questions', () => {
		const tpl: Template = {
			id: 'test',
			name: 'Test',
			description: '',
			pick: { left: 1, right: 0 },
			questions: [
				{ label: 'must appear', fieldType: 'short', section: 'left', required: true },
				{ label: 'optional a', fieldType: 'short', section: 'left' },
				{ label: 'optional b', fieldType: 'short', section: 'left' }
			]
		};
		const picked = pickTemplateQuestions(tpl);
		expect(picked.map((q) => q.label)).toContain('must appear');
	});

	it('draws a varying combination across repeated calls when the pool allows it', () => {
		const tpl = templates.find((t) => t.questions.length > t.pick.left + t.pick.right);
		expect(
			tpl,
			'expected at least one template with a pool larger than its pick count'
		).toBeDefined();

		const combos = new Set(
			Array.from({ length: 30 }, () =>
				pickTemplateQuestions(tpl!)
					.map((q) => q.label)
					.sort()
					.join('|')
			)
		);
		expect(combos.size).toBeGreaterThan(1);
	});
});
