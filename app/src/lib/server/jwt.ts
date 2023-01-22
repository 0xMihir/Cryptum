import { error, type RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { TOKEN_KEY } from '$env/static/private';

// returns public key from jwt in request or throws a 401 error if user is not signed in
export function pubKeyFromJwt(request: RequestEvent): string {
    const cookie = request.cookies.get("token");
    if (cookie == null) {
        throw error(401, "must be logged in");
    }

    try {
        const data = jwt.verify(cookie, TOKEN_KEY) as any;
        const pubKey = data['pubKey'] as string | undefined;
        if (pubKey == null) {
            throw error(401, "invalid jwt");
        }
        return pubKey;
    } catch (e) {
        throw error(401, "invalid jwt");
    }
}