import type { APIRoute } from "astro";
import { desc, sql } from "drizzle-orm";
import { getDB } from "src/db/drizzle";
import { Womps } from "src/db/schema";
import type { ENV } from "src/env";

export const prerendered = false;

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
  ]);
  const [leaderboardEntries, quarterTotals] = batchResponse;

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
  for (const total of quarterTotals) {
    wompData[total.quarter].total = total.total;
  }

  return wompData;
}

export type LeaderboardData = typeof getLeaderboard extends (
  env: ENV,
) => Promise<infer T>
  ? T
  : never;

export const GET: APIRoute<LeaderboardData> = async ({ locals }) => {
  const { env } = locals.runtime;
  const wompData = await getLeaderboard(env);

  return new Response(JSON.stringify(wompData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
