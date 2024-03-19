import type { APIRoute } from "astro";
import { createClient } from "@vercel/kv";

export const prerendered = false;

const { REDIS_REST_API_URL, REDIS_REST_API_TOKEN } = import.meta.env;
 
const kv = createClient({
  url: REDIS_REST_API_URL,
  token: REDIS_REST_API_TOKEN,
});
export const GET: APIRoute = async ({ cookies, request }) => {
    const params = new URL(request.url).searchParams;
    if (params.has("id")) {
        const username = await kv.get<string>(`user:${params.get("id")}`);
        if (!username) {
            return new Response("User not found", {
                status: 404,
            });
        }
        return new Response(username, {
            status: 200,
        })
    }
    const id = cookies.get("id")?.value;
    if (!id) {
        return new Response("ID was malformed", {
            status: 401,
        });
    }
    const username = await kv.get<string>(`user:${id}`);
    if (!username) {
        return new Response("User not found", {
            status: 404,
        });
    }
    cookies.set("username", username);
    return new Response(username, {
        status: 200,
    });
};