import { Client } from 'pg';
import { DATABASE_URL } from '$env/static/private';

export async function getUserFileUuid(userPubKey: string): Promise<string | null> {
	const DATABASEURL = DATABASE_URL;
	const config = {
		connectionString: DATABASEURL,
		ssl: {
			rejectUnauthorized: false
		}
	};
	const client = new Client(config); //process.env.DATABASE_URL
	try {
		await client.connect();
	} catch (e) {
		return null;
	}
	const query = {
		// give the query a unique name
		name: 'fetch-user',
		text: 'SELECT * FROM users WHERE pubkey = $1',
		values: [userPubKey]
	};
	const results = (await client.query(query)).rows;
	if (results.length > 0) {
		return results[0]['uuid'];
	} else {
		return null;
	}
}
