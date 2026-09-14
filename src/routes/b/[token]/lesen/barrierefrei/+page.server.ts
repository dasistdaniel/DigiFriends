import { loadBookAccess } from '$lib/server/guard';
import { loadBookForReading } from '$lib/server/reading';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const { access, locked } = await loadBookAccess(params.token, cookies);
	if (locked) return { locked: true as const };

	const data = await loadBookForReading(access, `/b/${params.token}/asset`);
	return { locked: false as const, ...data };
};
