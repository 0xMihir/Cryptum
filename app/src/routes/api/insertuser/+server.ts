import { json } from '@sveltejs/kit';
import { Client } from 'pg';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { DATABASE_URL } from '$env/static/private';

export const POST = (async ({ request }) => {
	const DATABASEURL = DATABASE_URL;
	const client = new Client(DATABASEURL); //process.env.DATABASE_URL
	try {
		await client.connect();
	} catch (e) {
		throw error(500, 'Could not connect to database');
	}
	let result = await request.json();
	const query = {
		// give the query a unique name
		name: 'insert-user',
		text: 'INSERT INTO users (name, uuid) VALUES ($1, $2)',
		values: [result['username'], result['uuid']]
	};
	try {
		const results = await client.query(query);
		return new Response(JSON.stringify({ success: true }));
	} catch {
		throw error(500, 'Could not insert user');
	}
}) satisfies RequestHandler;
