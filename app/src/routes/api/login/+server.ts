import type { RequestHandler } from './$types';
export const POST = (async ({ request }) => {
    const data = await request.json()

    

	return new Response(JSON.stringify({ success: true }));

}) satisfies RequestHandler;