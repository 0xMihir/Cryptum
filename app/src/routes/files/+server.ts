import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { createObject } from '$lib/server/googleCloud';

// creates a new file and returns the uuid
// file data will be request body
export async function POST(request: RequestEvent): Promise<Response> {
	const uuid = randomUUID();

	const data = (await request?.request?.body?.getReader().read())?.value;
	if (data == null) {
		throw error(400, "no data sent for file");
	}

	await createObject(uuid, data);

	return new Response(uuid);
}
