import { loadBookAccess, requireWrite } from '$lib/server/guard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return { locked: true as const };
	requireWrite(access);

	return {
		locked: false as const,
		book: { title: access.book.title, status: access.book.status },
		prefillName: access.invitePrefillName ?? ''
	};
};
