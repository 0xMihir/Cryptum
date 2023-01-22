import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { Client } from 'pg';
import { DATABASE_URL } from '$env/static/private';

export const POST = (async (request) => {
	const DATABASEURL = DATABASE_URL;

	const client = new Client(DATABASEURL); //process.env.DATABASE_URL
	try {
		await client.connect();
		await client.query(
			'CREATE TABLE IF NOT EXISTS users (name TEXT NOT NULL UNIQUE, pubkey TEXT NOT NULL UNIQUE, uuid TEXT NOT NULL UNIQUE)'
		);
	} catch (e) {
		throw error(500, 'Could not connect to database');
	}
	const data = await request.request.json();
	const query = {
		// give the query a unique name
		name: 'check-exists',
		text: 'SELECT * FROM users WHERE pubkey = $1',
		values: [data.pubKey] //should be pubkey
	};
	const results = await (await client.query(query)).rows;
	if (results.length > 0) {
		return new Response(JSON.stringify({ exists: true }));
	} else {
		return new Response(JSON.stringify({ exists: false }));
	}
}) satisfies RequestHandler;
