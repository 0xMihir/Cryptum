import { error } from '@sveltejs/kit';
import { Storage } from '@google-cloud/storage';

export async function getObject(name: string): Promise<string> {
    const storage = new Storage({
		projectId: 'cryptum',
		keyFilename: 'gc_keyfile/cryptum-cc63e7b7ac73.json'
	});

	const bucket = storage.bucket('cryptum-storage');

	async function streamFile() {
		// Downloads the file into a buffer in memory.
		const contents = await bucket.file(name).download();
		return contents.toString();
	}

	return await streamFile().catch(() => {
		throw error(500, 'unable to download file');
	});
}

export async function createObject(name: string, data: Uint8Array) {
    const storage = new Storage({
		projectId: 'cryptum',
		keyFilename: 'gc_keyfile/cryptum-cc63e7b7ac73.json'
	});

	const bucket = storage.bucket('cryptum-storage');

	let contents = data as Buffer;
	const blob = bucket.file(name);
	const blobStream = blob.createWriteStream({
		resumable: false
	});

    // FIXME: i don't think this error will always finish in time
	blobStream
		.on('error', () => {
			throw error(500, 'unable to upload file to cloud');
		})
		.end(contents);
}

export async function deleteObject(name: string) {
    const storage = new Storage({
		projectId: 'cryptum',
		keyFilename: 'gc_keyfile/cryptum-cc63e7b7ac73.json'
	});

	const bucket = storage.bucket('cryptum-storage');

	async function deleteFile() {
		await bucket.file(name).delete();
	}

	await deleteFile().catch(() => {
		throw error(500, 'unable to delete file');
	});
}