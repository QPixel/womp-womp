import type { APIRoute } from "astro";
import { createClient } from "@vercel/kv";
import { db, desc, sql, Womps } from "astro:db";

export const prerendered = false;

const { REDIS_REST_API_URL, REDIS_REST_API_TOKEN } = import.meta.env;

const kv = createClient({
    url: REDIS_REST_API_URL,
    token: REDIS_REST_API_TOKEN,
});

export async function getLeaderboard() {
    let wompTotals = await db.select({
        updated_by: Womps.updated_by,
        total: sql<number>`count(*)`.as("total"),
    }).from(Womps).groupBy(Womps.updated_by).orderBy(desc(sql`total`)).limit(10);
    let wompData = await Promise.all(wompTotals.map(async (womp) => {
        const username = await kv.get<string>(`user:${womp.updated_by}`);
        return {
            total: womp.total,
            updatedBy: womp.updated_by,
            resolved_username: username ? username : "Unknown",
        };
    }));
    return wompData;
}

export const GET: APIRoute<{
    total: number;
    updatedBy: number;
    resolved_username: string;
}> = async () => {
    let wompData = await getLeaderboard();

    return new Response(JSON.stringify(wompData), { status: 200, headers: { "Content-Type": "application/json" } });
};