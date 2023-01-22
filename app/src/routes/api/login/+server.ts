import type { RequestHandler } from './$types';
import jwt from 'jsonwebtoken';
import * as ed from '@noble/ed25519';
import { TOKEN_KEY } from '$env/static/private';


const fromHexString = (hexString: string) =>
	Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

export const POST = (async ({ request, cookies }) => {
	const data = await request.json();

	console.log(data);

	cookies.set(
		'token',
		jwt.sign({ data }, TOKEN_KEY, {
			expiresIn: '2h'
		}),
		{
			maxAge: 60 * 60 * 24 * 7,
			path: '/',
			sameSite: 'lax',
			httpOnly: true,
			secure: true
		}
	);

	// try {
	// 	const privateKey = ed.utils.randomPrivateKey();
	// 	const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
	// 	const publicKey = await ed.getPublicKey(privateKey);
	// 	const signature = await ed.sign(message, privateKey);
	// 	console.log(signature, message, publicKey);

	//     console.log('signature', fromHexString(data.sig));
	//     console.log('message', fromHexString(data.nonce));
	//     console.log('publicKey', fromHexString(data.pubKey));

	// 	const isValid = await ed.verify(signature, message, publicKey);
	// } catch (e) {
	// 	console.log(e);
	// }

	return new Response();
}) satisfies RequestHandler;
