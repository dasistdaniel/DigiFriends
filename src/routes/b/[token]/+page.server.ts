import { redirect } from '@sveltejs/kit';
import { resolveAccess, verifyAccessPassword } from '$lib/server/books';
import { markUnlocked } from '$lib/server/access';
import type { Actions, PageServerLoad } from './$types';

/** Blanker Buch-Link -> passende Ansicht. */
export const load: PageServerLoad = async ({ params, parent }) => {
	const { role } = await parent();
	const view = role === 'admin' ? 'admin' : role === 'write' ? 'schreiben' : 'lesen';
	redirect(307, `/b/${params.token}/${view}`);
};

/** Passwort-Eingabe des Link-Gates. */
export const actions: Actions = {
	default: async ({ request, params, cookies }) => {
		const access = await resolveAccess(params.token);

		const fd = await request.formData();
		const password = String(fd.get('password') ?? '');
		const rt = String(fd.get('redirectTo') ?? '');
		const target = rt.startsWith(`/b/${params.token}/`) ? rt : `/b/${params.token}/lesen`;

		if (!access || !(await verifyAccessPassword(params.token, password))) {
			redirect(303, `${target}?pw=1`);
		}

		markUnlocked(cookies, access.accessId);
		redirect(303, target);
	}
};
