import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { getUserFileUuid } from '$lib/server/db';
import { createObject, getObject } from '$lib/server/googleCloud';

async function getUserRootUuid(requestEvent: RequestEvent): Promise<string> {
	const pubKey = (await requestEvent.request.json())['uuid'];
	const uuid = await getUserFileUuid(pubKey);
	if (uuid != null) {
		return uuid;
	} else {
		throw error(400, "not logged in");
	}
}

// returns the root folder for the current user
export async function GET(requestEvent: RequestEvent): Promise<Response> {
	const uuid = await getUserRootUuid(requestEvent);
	return new Response(await getObject(uuid));
}

// set the root folder for the current user
export async function POST(requestEvent: RequestEvent): Promise<Response> {
	const uuid = await getUserRootUuid(requestEvent);

	const data = (await requestEvent?.request?.body?.getReader().read())?.value;
	if (data == null) {
		throw error(400, "no data sent for root");
	}

	await createObject(uuid, data);

	return new Response();
}
