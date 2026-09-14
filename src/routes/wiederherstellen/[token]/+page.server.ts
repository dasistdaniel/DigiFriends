import { checkRecoveryToken, redeemRecovery } from '$lib/server/recovery';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return { check: await checkRecoveryToken(params.token) };
};

export const actions: Actions = {
	default: async ({ params }) => {
		return { redeemed: await redeemRecovery(params.token) };
	}
};
