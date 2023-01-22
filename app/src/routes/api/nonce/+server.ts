import type { RequestHandler } from './$types';
import { randomBytes } from 'crypto';

export const GET = (async () => {
	return new Response(JSON.stringify({ nonce: randomBytes(24).toString('hex') }));
}) satisfies RequestHandler;
