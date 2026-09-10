import { serveAsset } from '$lib/server/assets';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params, cookies }) =>
	serveAsset(params.token, params.assetId, cookies, 'full');
