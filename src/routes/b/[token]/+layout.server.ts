import { error } from '@sveltejs/kit';
import { resolveAccess } from '$lib/server/books';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
	const access = await resolveAccess(params.token);
	if (!access) error(404, 'Dieses Buch gibt es nicht (mehr).');

	return {
		token: params.token,
		role: access.role,
		book: {
			id: access.book.id,
			title: access.book.title,
			subtitle: access.book.subtitle,
			introText: access.book.introText,
			status: access.book.status,
			moderationMode: access.book.moderationMode
		}
	};
};
