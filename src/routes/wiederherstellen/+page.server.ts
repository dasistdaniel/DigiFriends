import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { MAIL_ENABLED } from '$lib/server/env';
import { requestRecovery } from '$lib/server/recovery';
import type { Actions, PageServerLoad } from './$types';

const schema = z.object({
	email: z.string().trim().email('Bitte eine gültige E-Mail-Adresse eingeben.').max(200)
});

export const load: PageServerLoad = () => {
	return { mailEnabled: MAIL_ENABLED };
};

export const actions: Actions = {
	default: async ({ request }) => {
		if (!MAIL_ENABLED) {
			return fail(403, {
				message: 'Die E-Mail-Wiederherstellung ist auf diesem Server noch nicht eingerichtet.'
			});
		}
		const parsed = schema.safeParse({ email: (await request.formData()).get('email') });
		if (!parsed.success) {
			return fail(400, { message: 'Bitte eine gültige E-Mail-Adresse eingeben.' });
		}

		await requestRecovery(parsed.data.email);
		return { sent: true };
	}
};
