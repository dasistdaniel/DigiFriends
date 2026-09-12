import { isOperatorSession, operatorEnabled } from '$lib/server/operator';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies }) => {
	return {
		enabled: operatorEnabled(),
		authenticated: operatorEnabled() && isOperatorSession(cookies)
	};
};
