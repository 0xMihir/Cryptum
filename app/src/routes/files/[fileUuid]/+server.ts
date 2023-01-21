import type { RequestEvent } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { readFile } from "fs/promises";
import { join } from 'path/posix';

import { STORAGE_DIR } from "../../../lib/server/config";

// retrieves file with the given uuid
export async function GET(request: RequestEvent): Promise<Response> {
    const fileUuid = request.params.fileUuid ?? "";

    // TODO: check if user owns this file
    
    // TODO: figure out if join prevent directory traversal
    let data;
    try {
        console.log(join(STORAGE_DIR, fileUuid));
        data = await readFile(join(STORAGE_DIR, fileUuid));
    } catch (e) {
        throw error(404, "requested file does not exist");
    }

    return new Response(data);
}