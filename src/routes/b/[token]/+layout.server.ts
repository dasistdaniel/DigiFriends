import { error } from '@sveltejs/kit';
import { resolveAccess } from '$lib/server/books';
import { isUnlocked } from '$lib/server/access';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, cookies }) => {
	const access = await resolveAccess(params.token);
	if (!access) error(404, 'Dieses Buch gibt es nicht (mehr).');
	if (access.book.suspendedAt) {
		error(403, 'Dieses Buch wurde vom Betreiber gesperrt.');
	}

	const locked = access.hasPassword && !isUnlocked(cookies, access.accessId);

	return {
		token: params.token,
		role: access.role,
		locked,
		bookTitle: access.book.title
	};
};
