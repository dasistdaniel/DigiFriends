import { loadBookAccess, requireAdmin } from '$lib/server/guard';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, cookies }) => {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return { locked: true as const };
	requireAdmin(access);

	return {
		locked: false as const,
		bookId: access.book.id,
		adminBook: {
			title: access.book.title,
			subtitle: access.book.subtitle,
			introText: access.book.introText,
			status: access.book.status,
			moderationMode: access.book.moderationMode,
			openWriteEnabled: access.book.openWriteEnabled,
			recoveryEmail: access.book.recoveryEmail,
			design: access.book.design
		}
	};
};
