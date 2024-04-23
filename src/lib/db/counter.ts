import { eq, sql } from "drizzle-orm";
import { Womps } from "./schema";
import { getDB } from "./drizzle";
import type { ENV } from "../../app";

async function resolveUsernameFromId(id: number, kv: KVNamespace) {
    // resolve the async promise inline
    const username = await kv.get<string>(`user:${id}`);
    return username ? username : "Unknown";
}

async function getCounterWithQuarter(currentQuarter: string, env: ENV) {
    const db = getDB(env);
    const wompQuery = db
        .select({
            max_date: sql<Date>`max(last_updated)`.as("max_date"),
            total: sql<number>`count(*)`.as("total"),
        })
        .from(Womps)
        .where(eq(Womps.quarter_id, currentQuarter))
        .as("wompQuery");

    const womps = await db
        .select({
            updated_by: Womps.updated_by,
            last_updated: Womps.last_updated,
            total: sql<number>`wompQuery.total`,
            quarter: Womps.quarter_id,
        })
        .from(wompQuery)
        .innerJoin(Womps, eq(Womps.last_updated, wompQuery.max_date))
        .limit(1);

    return womps;
}

export async function getCounterData(env: ENV) {
    const kv = env.WOMP_KV;
    let currentQuarter = await kv.get<string>("current_quarter");
    if (!currentQuarter) {
        currentQuarter = "24-Q2";
    }
    const womps = await getCounterWithQuarter(currentQuarter, env);

    if (!womps || womps.length == 0 || !womps[0].last_updated) {
        return {
            total: 0,
            last_updated: new Date(),
            updated_by: 0,
            resolved_username: "Unknown",
        };
    }
    const resolved_username = await resolveUsernameFromId(
        womps[0].updated_by,
        kv,
    );
    return {
        total: womps[0].total,
        last_updated: womps[0].last_updated,
        updated_by: womps[0].updated_by,
        resolved_username,
    };
}

export type CounterData = typeof getCounterData extends (
    env: ENV,
) => Promise<infer T>
    ? T
    : never;