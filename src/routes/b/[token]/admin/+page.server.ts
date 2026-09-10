import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { role } = await parent();
	if (role !== 'admin') error(403, 'Dieser Link darf das Buch nicht verwalten.');
	return {};
};
