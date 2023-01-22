import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { getUserFileUuid } from '$lib/server/db';

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
	return new Response();
}

// set the root folder for the current user
export async function POST(requestEvent: RequestEvent): Promise<Response> {
	const uuid = await getUserRootUuid(requestEvent);
	return new Response();
}
