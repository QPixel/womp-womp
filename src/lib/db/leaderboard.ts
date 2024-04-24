import { desc, sql } from "drizzle-orm";
import { Womps } from "./schema";
import { getDB } from "./drizzle";
import type { ENV } from "../../app";

export async function getLeaderboard(env: ENV) {
    const kv = env.WOMP_KV;
    const db = getDB(env);
    const batchResponse = await db.batch([
        db
            .select({
                updated_by: Womps.updated_by,
                total: sql<number>`count(*)`.as("total"),
                quarter: Womps.quarter_id,
            })
            .from(Womps)
            .groupBy(Womps.quarter_id, Womps.updated_by)
            .orderBy(desc(sql`total`))
            .limit(10),
        db
            .select({
                total: sql<number>`count(*)`.as("total"),
                quarter: Womps.quarter_id,
            })
            .from(Womps)
            .groupBy(Womps.quarter_id)
            .orderBy(desc(sql`total`)),
        db
            .select({
                updated_by: Womps.updated_by,
                total: sql<number>`count(*)`.as("total"),
            })
            .from(Womps)
            .groupBy(Womps.updated_by)
            .orderBy(desc(sql`total`))
            .limit(10),
        db
            .select({
                total: sql<number>`count(*)`.as("total"),
            })
            .from(Womps)
            .orderBy(desc(sql`total`)),
    ]);
    const [leaderboardEntries, quarterTotals, allTime, allTimeTotal] = batchResponse;


    const wompData: Record<
        string,
        {
            data: Array<
                Omit<(typeof leaderboardEntries)[0], "quarter"> & {
                    resolved_username: string;
                }
            >;
            total: number;
        }
    > = {};
    // Quarterly Leaderboard
    for (const entry of leaderboardEntries) {
        const username = await kv.get<string>(`user:${entry.updated_by}`);
        if (!wompData[entry.quarter]) {
            wompData[entry.quarter] = { data: [], total: 0 };
        }
        wompData[entry.quarter].data.push({
            total: entry.total,
            updated_by: entry.updated_by,
            resolved_username: username ? username : "Unknown",
        });
    }

    // All Time Leaderboard
    for (const entry of allTime) {
        const username = await kv.get<string>(`user:${entry.updated_by}`);
        if (!wompData["all_time"]) {
            wompData["all_time"] = { data: [], total: 0 };
        }
        wompData["all_time"].data.push({
            total: entry.total,
            updated_by: entry.updated_by,
            resolved_username: username ? username : "Unknown",
        });
    }

    for (const entry of Object.values(wompData)) {
        entry.data.sort((a, b) => {
            if (a.total > b.total) {
                return -1;
            }
            if (a.total < b.total) {
                return 1;
            }
            if (a.resolved_username < b.resolved_username) {
                return -1;
            }
            return 0;
        });
    }

    for (const total of quarterTotals) {
        wompData[total.quarter].total = total.total;
    }

    wompData["all_time"].total = allTimeTotal[0].total;

    return wompData;
}

export type LeaderboardData = typeof getLeaderboard extends (
    env: ENV,
) => Promise<infer T>
    ? T
    : never;