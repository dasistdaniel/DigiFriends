import { serveAssetForOperator } from '$lib/server/assets';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params, cookies }) =>
	serveAssetForOperator(cookies, params.bookId, params.assetId, 'full');
