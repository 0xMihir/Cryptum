import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { deleteObject, getObject } from '$lib/server/googleCloud';

// retrieves file with the given uuid
export async function GET(request: RequestEvent): Promise<Response> {
	const fileUuid = request.params.fileUuid;

	if (fileUuid == null) {
		throw error(400, "no file uuid specified");
	}

	// TODO: check if user owns this file
	return new Response(await getObject(fileUuid));
}

export async function DELETE(request: RequestEvent): Promise<Response> {
	const fileUuid = request.params.fileUuid;

	if (fileUuid == null) {
		throw error(400, "no file uuid specified");
	}

	// TODO: check if user owns this file
	deleteObject(fileUuid);

	return new Response('file successfully deleted');
}
