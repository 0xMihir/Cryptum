import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { createObject } from '$lib/server/googleCloud';
import { pubKeyFromJwt } from '$lib/server/jwt';

// creates a new file and returns the uuid
// file data will be request body
export async function POST(request: RequestEvent): Promise<Response> {
	const pubKey = pubKeyFromJwt(request);
	const uuid = randomUUID();

	let data;
	try {
		data = new Uint8Array(await request.request.arrayBuffer());
	} catch (e) {
		throw error(400, "no data sent for file");
	}
	
	await createObject(pubKey + ":" + uuid, data);

	return new Response(uuid);
}
