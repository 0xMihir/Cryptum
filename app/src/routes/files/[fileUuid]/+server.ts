import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path/posix';

import { STORAGE_DIR } from '../../../lib/server/config';
import { Storage } from '@google-cloud/storage';

// retrieves file with the given uuid
export async function GET(request: RequestEvent): Promise<Response> {
	const fileUuid = request.params.fileUuid ?? '';

	// TODO: check if user owns this file
	const storage = new Storage({
		projectId: 'cryptum',
		keyFilename: 'gc_keyfile/cryptum-cc63e7b7ac73.json'
	});

	const bucket = storage.bucket('cryptum-storage');

	async function streamFile() {
		// Downloads the file into a buffer in memory.
		const contents = await bucket.file(fileUuid).download();
		return contents.toString();
	}

	let data = await streamFile().catch(() => {
		throw error(500, 'unable to download file');
	});

	return new Response(data);
}

export async function DELETE(request: RequestEvent): Promise<Response> {
	const fileUuid = request.params.fileUuid ?? '';

	// TODO: check if user owns this file

	const storage = new Storage({
		projectId: 'cryptum',
		keyFilename: 'gc_keyfile/cryptum-cc63e7b7ac73.json'
	});

	const bucket = storage.bucket('cryptum-storage');

	async function deleteFile() {
		await bucket.file(fileUuid).delete();
	}

	await deleteFile().catch(() => {
		throw error(500, 'unable to delete file');
	});

	return new Response('file successfully deleted');
}
