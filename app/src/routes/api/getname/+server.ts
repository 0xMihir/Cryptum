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
		name: 'fetch-user',
		text: 'SELECT * FROM users WHERE uuid = $1',
		values: [result['uuid']]
	};
	const results = await (await client.query(query)).rows;
	if (results.length > 0) {
		return new Response(JSON.stringify({ exists: true, results: results}));
	} else {
		return new Response(JSON.stringify({ exists: false }));
	}
}) satisfies RequestHandler;