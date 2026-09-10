import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import { templates, defaultTemplateId, getTemplate } from '$lib/templates';
import { ORIGIN, SIGNUP_MODE } from '$lib/server/env';
import { createBook } from '$lib/server/books';
import type { Actions, PageServerLoad } from './$types';

const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((v) => v || undefined)
		.optional();

const schema = z.object({
	title: z.string().trim().min(1, 'Bitte einen Titel angeben.').max(120),
	subtitle: optionalText(120),
	introText: optionalText(2000),
	templateId: z.string().refine((id) => getTemplate(id) !== undefined, 'Unbekannte Vorlage.'),
	moderationMode: z.enum(['instant', 'review']),
	recoveryEmail: z
		.string()
		.trim()
		.max(200)
		.refine((v) => v === '' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), 'Ungültige E-Mail-Adresse.')
		.transform((v) => v || undefined)
		.optional(),
	passwordAdmin: optionalText(200),
	passwordRead: optionalText(200),
	passwordWrite: optionalText(200)
});

export const load: PageServerLoad = () => {
	if (SIGNUP_MODE === 'closed') {
		error(403, 'Das Anlegen neuer Bücher ist auf diesem Server deaktiviert.');
	}
	return {
		templates: templates.map(({ id, name, description }) => ({ id, name, description })),
		defaultTemplateId
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		if (SIGNUP_MODE === 'closed') return fail(403, { message: 'Deaktiviert.' });

		const form = Object.fromEntries(await request.formData());
		const parsed = schema.safeParse(form);
		if (!parsed.success) {
			const { fieldErrors } = z.flattenError(parsed.error);
			return fail(400, { values: form, errors: fieldErrors });
		}
		const d = parsed.data;

		for (const [key, pw] of Object.entries({
			passwordAdmin: d.passwordAdmin,
			passwordRead: d.passwordRead,
			passwordWrite: d.passwordWrite
		})) {
			if (pw && pw.length < 4) {
				return fail(400, {
					values: form,
					errors: { [key]: ['Mindestens 4 Zeichen.'] }
				});
			}
		}

		const { tokens } = await createBook({
			title: d.title,
			subtitle: d.subtitle,
			introText: d.introText,
			templateId: d.templateId,
			moderationMode: d.moderationMode,
			recoveryEmail: d.recoveryEmail,
			passwords: { admin: d.passwordAdmin, read: d.passwordRead, write: d.passwordWrite }
		});

		return {
			created: {
				title: d.title,
				links: {
					admin: `${ORIGIN}/b/${tokens.admin}/admin`,
					write: `${ORIGIN}/b/${tokens.write}/schreiben`,
					read: `${ORIGIN}/b/${tokens.read}/lesen`
				}
			}
		};
	}
};
