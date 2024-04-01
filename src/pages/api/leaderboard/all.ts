import type { APIRoute } from "astro";
import { createClient } from "@vercel/kv";
import { db, desc, eq, sql, Womps } from "astro:db";

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
        quarter: Womps.quarter_id,
    }).from(Womps).groupBy(Womps.quarter_id, Womps.updated_by).orderBy(desc(sql`total`)).limit(10);
    let womp = await db.select({
        total: sql<number>`count(*)`.as("total"),
        quarter: Womps.quarter_id,
    }).from(Womps).groupBy(Womps.quarter_id).orderBy(desc(sql`total`));
    
    let wompData: Record<string, {
        data: Array<Omit<typeof wompTotals[0], "quarter"> & {resolved_username: string}>;
        total: number;
    }> = {}
    for (let womp of wompTotals) {
        let username = await kv.get<string>(`user:${womp.updated_by}`);
        if (!wompData[womp.quarter]) {
            wompData[womp.quarter] = { data: [], total: 0 };
        }
        wompData[womp.quarter].data.push({
            total: womp.total,
            updated_by: womp.updated_by,
            resolved_username: username ? username : "Unknown",
        });
    }
    for (let total of womp) {
        wompData[total.quarter].total = total.total;
    }

    return wompData;
}


export type LeaderboardData = typeof getLeaderboard extends () => Promise<infer T> ? T : never;

export const GET: APIRoute<LeaderboardData> = async () => {
    let wompData = await getLeaderboard();

    return new Response(JSON.stringify(wompData), { status: 200, headers: { "Content-Type": "application/json" } });
};