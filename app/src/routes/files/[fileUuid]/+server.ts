import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { deleteObject, getObject } from '$lib/server/googleCloud';
import { pubKeyFromJwt } from '$lib/server/jwt';

// retrieves file with the given uuid
export async function GET(request: RequestEvent): Promise<Response> {
	const pubKey = pubKeyFromJwt(request);
	const fileUuid = request.params.fileUuid;

	if (fileUuid == null) {
		throw error(400, "no file uuid specified");
	}

	const data = await getObject(pubKey + ":" + fileUuid);
	if (data == null) {
		throw error(404, "file does not exist");
	}

	return new Response(data);
}

export async function DELETE(request: RequestEvent): Promise<Response> {
	const pubKey = pubKeyFromJwt(request);
	const fileUuid = request.params.fileUuid;

	if (fileUuid == null) {
		throw error(400, "no file uuid specified");
	}

	deleteObject(pubKey + ":" + fileUuid);

	return new Response('file successfully deleted');
}
