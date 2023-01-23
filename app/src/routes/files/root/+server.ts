import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { getUserFileUuid } from '$lib/server/db';
import { createObject, getObject } from '$lib/server/googleCloud';
import { pubKeyFromJwt } from '$lib/server/jwt';

async function getUserRootUuid(requestEvent: RequestEvent): Promise<string> {
	const pubKey = pubKeyFromJwt(requestEvent);
	const uuid = await getUserFileUuid(pubKey);
	if (uuid != null) {
		return uuid;
	} else {
		throw error(400, 'not logged in');
	}
}

// returns the root folder for the current user
export async function GET(requestEvent: RequestEvent): Promise<Response> {
	const uuid = await getUserRootUuid(requestEvent);
	const rootData = await getObject(uuid);

	if (rootData == null) {
		// root data not yet created
		throw error(404, 'the root has not been created yet');
	} else {
		return new Response(rootData);
	}
}

// set the root folder for the current user
export async function POST(requestEvent: RequestEvent): Promise<Response> {
	const uuid = await getUserRootUuid(requestEvent);

	let data;
	try {
		data = new Uint8Array(await requestEvent.request.arrayBuffer());
	} catch (e) {
		throw error(400, 'no data sent for root');
	}

	await createObject(uuid, data);

	return new Response();
}
