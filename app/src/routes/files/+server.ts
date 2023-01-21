import type { RequestEvent } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { randomUUID } from 'crypto';
import { join } from 'path/posix';
import { writeFile } from "fs/promises";

import { STORAGE_DIR } from "../../lib/server/config";

// creates a new file and returns the uuid
// file data will be request body
export async function POST(request: RequestEvent): Promise<Response> {
    const uuid = randomUUID();
    const filePath = join(STORAGE_DIR, uuid);

    const data = (await request?.request?.body?.getReader().read())?.value;
    if (data == null) {
        throw error(400, "body required");
    }

    try {
        await writeFile(filePath, data);
    } catch (e) {
        throw error(500, "could not write data to file");
    }

    return new Response(uuid);
}