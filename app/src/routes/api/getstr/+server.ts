import { json } from '@sveltejs/kit';
import { Client } from 'pg';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { DATABASE_URL } from '$env/static/private';
import { randomBytes } from 'crypto';

export const GET = (async ({ request }) => {
	var id = randomBytes(20).toString('hex');
	return new Response(JSON.stringify({ id: id }));
}) satisfies RequestHandler;
