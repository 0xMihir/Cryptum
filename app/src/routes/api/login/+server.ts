import type { RequestHandler } from './$types';
import jwt from 'jsonwebtoken';
import * as ed from '@noble/ed25519';
import { TOKEN_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';

export const POST = (async ({ request, cookies }) => {
	const data = await request.json();
	let verified = false;
	try {
		verified = await ed.verify(data.sig, data.nonce, data.pubKey);
	} catch (e) {
		throw error(400, 'Error verifying signature');
	}

	if (verified) {
		cookies.set(
			'token',
			jwt.sign(
				{
					pubKey: data.pubKey,
				},
				TOKEN_KEY,
				{
					expiresIn: '2h'
				}
			),
			{
				maxAge: 60 * 60 * 24 * 7,
				path: '/',
				sameSite: 'lax',
				httpOnly: false,

			}
		);
	} else {
		throw error(401, 'Invalid signature');
	}

	return new Response();
}) satisfies RequestHandler;
