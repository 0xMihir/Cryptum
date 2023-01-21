import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { join } from 'path/posix';
import { writeFile } from 'fs/promises';

import { STORAGE_DIR } from '../../lib/server/config';
import { Storage } from '@google-cloud/storage';

// creates a new file and returns the uuid
// file data will be request body
export async function POST(request: RequestEvent): Promise<Response> {
	const uuid = randomUUID();

	const storage = new Storage({
		projectId: 'cryptum',
		keyFilename: 'gc_keyfile/cryptum-cc63e7b7ac73.json'
	});

	const bucket = storage.bucket('cryptum-storage');

	const data = (await request?.request?.body?.getReader().read())?.value;

	let contents = data as Buffer;
	const blob = bucket.file(uuid);
	const blobStream = blob.createWriteStream({
		resumable: false
	});
	await blobStream
		.on('finish', () => {
			return new Response('file uploaded');
		})
		.on('error', () => {
			throw error(500, 'unable to upload file to cloud');
		})
		.end(contents);
}
