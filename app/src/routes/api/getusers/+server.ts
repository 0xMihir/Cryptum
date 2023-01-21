import { json } from '@sveltejs/kit';
import { Client } from 'pg';
import type { RequestHandler } from './$types';


export const POST = (async ({request}) => {
    const DATABASEURL = "postgresql://cygnusx26:wr_zAhUEuJ3IrtO9d8t_-A@cloned-goblin-6951.5xj.cockroachlabs.cloud:26257/users?sslmode=verify-full"
    const client = new Client(DATABASEURL); //process.env.DATABASE_URL
    client.connect((err) => {
        if (err) {
            return new Response(String(err));
        }
    });
    let result = await request.json();
    const query = {
        // give the query a unique name
        name: 'fetch-user',
        text: 'SELECT * FROM users WHERE name = $1 AND uuid = $2',
        values: [result["username"], result["uuid"]],
    }
    await client.query('CREATE TABLE IF NOT EXISTS users (name TEXT, uuid TEXT)');
    const results = await (await client.query(query)).rows;
    if (results.length > 0) {
        //connect encryption stuff here
        console.log("exists!")
        return new Response("Authenticated");
    } else {
        const query = {
            // give the query a unique name
            name: 'insert-user',
            text: 'INSERT INTO users (name, uuid) VALUES ($1, $2)',
            values: [result["username"], result["uuid"]],
        }
        await client.query(query);
    }
    return new Response("bruh");
}) satisfies RequestHandler;