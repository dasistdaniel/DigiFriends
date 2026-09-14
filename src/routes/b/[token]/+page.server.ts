import { redirect } from '@sveltejs/kit';
import { resolveAccess, verifyAccessPassword } from '$lib/server/books';
import { markUnlocked } from '$lib/server/access';
import { rateLimit } from '$lib/server/rateLimit';
import type { Actions, PageServerLoad } from './$types';

/** Gegen Durchprobieren: je IP+Link nur begrenzt viele Passwort-Versuche. */
const PASSWORD_ATTEMPT_LIMIT = 10;
const PASSWORD_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

/** Blanker Buch-Link -> passende Ansicht. */
export const load: PageServerLoad = async ({ params, parent }) => {
	const { role } = await parent();
	const view = role === 'admin' ? 'admin' : role === 'write' ? 'schreiben' : 'lesen';
	redirect(307, `/b/${params.token}/${view}`);
};

/** Passwort-Eingabe des Link-Gates. */
export const actions: Actions = {
	default: async ({ request, params, cookies, getClientAddress }) => {
		const fd = await request.formData();
		const password = String(fd.get('password') ?? '');
		const rt = String(fd.get('redirectTo') ?? '');
		const target = rt.startsWith(`/b/${params.token}/`) ? rt : `/b/${params.token}/lesen`;

		const allowed = rateLimit(`pw:${getClientAddress()}:${params.token}`, {
			limit: PASSWORD_ATTEMPT_LIMIT,
			windowMs: PASSWORD_ATTEMPT_WINDOW_MS
		});
		if (!allowed) redirect(303, `${target}?pw=rate`);

		const access = await resolveAccess(params.token);
		if (!access || !(await verifyAccessPassword(params.token, password))) {
			redirect(303, `${target}?pw=1`);
		}

		markUnlocked(cookies, access.accessId);
		redirect(303, target);
	}
};
