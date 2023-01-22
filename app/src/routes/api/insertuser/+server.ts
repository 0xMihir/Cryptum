import { json } from '@sveltejs/kit';
import Client from 'pg';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { DATABASE_URL } from '$env/static/private';
import { randomUUID } from 'crypto';

export const POST = (async ({ request }) => {
	const DATABASEURL = DATABASE_URL;

	const client = new Client.Client(DATABASEURL); //process.env.DATABASE_URL
	try {
		await client.connect();
	} catch (e) {
		console.log(e);
		throw error(500, 'Could not connect to database');
	}
	const data = await request.json();
	const query = {
		// give the query a unique name
		name: 'insert-user',
		text: 'INSERT INTO users (name, pubkey, uuid) VALUES ($1, $2, $3)',
		values: [data.username, data.pubKey, randomUUID()]
	};
	const results = await client.query(query);
	try {
		return new Response(JSON.stringify({ success: true }));
	} catch {
		throw error(500, 'Could not insert user');
	}
}) satisfies RequestHandler;
