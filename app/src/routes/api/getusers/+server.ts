import { json } from '@sveltejs/kit';
import { Client } from 'pg';

export async function POST(request: Request) {
    const DATABASEURL = "postgresql://cygnusx26:wr_zAhUEuJ3IrtO9d8t_-A@cloned-goblin-6951.5xj.cockroachlabs.cloud:26257/users?sslmode=verify-full"
    const client = new Client(DATABASEURL); //process.env.DATABASE_URL
    client.connect((err) => {
        if (err) {
            return new Response(String(err));
        }
    });
    console.log(request.body);
    const query = {
        // give the query a unique name
        name: 'fetch-user',
        text: 'SELECT * FROM users WHERE name = $1 AND uuid = $2',
        values: ['brianc', 'UUID'],
    }
    await client.query('CREATE TABLE IF NOT EXISTS users (name TEXT, uuid TEXT)');
    const results = await (await client.query(query)).rows;
    if (results.length > 0) {

    }
    return new Response();
}