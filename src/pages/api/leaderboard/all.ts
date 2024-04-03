import type { APIContext, APIRoute } from "astro";
// import { db, desc, eq, sql, Womps } from "astro:db";
import { getDB } from "src/db/drizzle";
import { Womps } from "src/db/schema";
import type { KVNamespace } from "@cloudflare/workers-types";
import type { ENV } from "src/env";
import { desc, sql } from "drizzle-orm";

// import { getDB } from "src/db/drizzle";

export const prerendered = false;


export async function getLeaderboard(env: ENV) {
    const {WOMP_KV: kv, WOMP_DB} = env;
    const db = getDB(env);
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


export type LeaderboardData = typeof getLeaderboard extends (env: ENV) => Promise<infer T> ? T : never;

export const GET: APIRoute<LeaderboardData> = async ({locals}) => {
    const { env } = locals.runtime;
    let wompData = await getLeaderboard(env);

    return new Response(JSON.stringify(wompData), { status: 200, headers: { "Content-Type": "application/json" } });
};

