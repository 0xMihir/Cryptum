import { error } from '@sveltejs/kit';
import { Storage } from '@google-cloud/storage';
import { Stream } from 'stream';
import { GC_KEYFILE } from '$env/static/private';

// returns null if file doesn't exist
export async function getObject(name: string): Promise<Uint8Array | null> {
	const storage = new Storage({
		projectId: 'cryptum',
		keyFilename: GC_KEYFILE
	});

	const bucket = storage.bucket('cryptum-storage');

	async function streamFile() {
		// Downloads the file into a buffer in memory.
		const contents = await bucket.file(name).download();
		return new Uint8Array(contents[0]);
	}

	try {
		return await streamFile();
	} catch (e) {
		return null;
	}
}

export async function createObject(name: string, data: Uint8Array) {
	const storage = new Storage({
		projectId: 'cryptum',
		keyFilename: GC_KEYFILE
	});

	const bucket = storage.bucket('cryptum-storage');

	const file = bucket.file(name);

	const passthroughStream = new Stream.PassThrough();
	passthroughStream.write(data);
	passthroughStream.end();

	async function streamFileUpload() {
		await passthroughStream.pipe(file.createWriteStream());
	}
	await streamFileUpload().catch(() => {
		throw error(500, 'unable to create file');
	});
}

export async function deleteObject(name: string) {
	const storage = new Storage({
		projectId: 'cryptum',
		keyFilename: GC_KEYFILE
	});

	const bucket = storage.bucket('cryptum-storage');

	async function deleteFile() {
		await bucket.file(name).delete();
	}

	await deleteFile().catch(() => {
		throw error(500, 'unable to delete file');
	});
}
