import type { APIRoute } from "astro";
import type { KVNamespace } from "@cloudflare/workers-types";
import { db, desc, eq, sql, Womps } from "astro:db";



export async function getLeaderboardByQuarter(quarter: string, kv: KVNamespace) {
    let wompTotals = await db.select({
        updated_by: Womps.updated_by,
        total: sql<number>`count(*)`.as("total"),
    }).from(Womps).where(eq(Womps.quarter_id, quarter)).groupBy(Womps.updated_by).orderBy(desc(sql`total`)).limit(10);
    let wompData = await Promise.all(wompTotals.map(async (womp) => {
        const username = await kv.get<string>(`user:${womp.updated_by}`);
        return {
            total: womp.total,
            updated_by: womp.updated_by,
            resolved_username: username ? username : "Unknown",
        };
    }));
    return wompData;
}

export async function getQuarters(kv: KVNamespace) {
    let quartersData = await db.select({
        quarter_id: Womps.quarter_id,
    }).from(Womps);
    let quarters = new Set(quartersData.map((quarter) => quarter.quarter_id));
    let currentQuarter = await kv.get<string>("current_quarter");
    if (currentQuarter) {
        // make the current quarter the first in the list
        return Array.from(quarters).sort((a, b) => a === currentQuarter ? -1 : b === currentQuarter ? 1 : 0);
    }
    return Array.from(quarters)
}

export type LeaderboardDataByQuarter = typeof getLeaderboardByQuarter extends (kv: KVNamespace) => Promise<infer T> ? T : never;

export const GET: APIRoute<LeaderboardDataByQuarter> = async ({request: {url}, locals}) => {
    let quarter = new URL(url).searchParams.get("quarter");
    if (typeof quarter !== "string") {
        return new Response("Invalid quarter", { status: 400 });
    }
    const kv = locals.runtime.env.WOMP_KV;

    let wompData = await getLeaderboardByQuarter(quarter, kv);



    return new Response(JSON.stringify(wompData), { status: 200, headers: { "Content-Type": "application/json" } });
};