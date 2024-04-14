import type { KVNamespace } from "@cloudflare/workers-types";
import type { APIRoute } from "astro";
import { compareAsc } from "date-fns";
import { eq, sql } from "drizzle-orm";
import { getDB } from "src/db/drizzle";
import { Womps } from "src/db/schema";
import type { ENV } from "src/env";

export const prerendered = false;

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

export const GET: APIRoute<CounterData> = async ({ locals }) => {
  const womps = await getCounterData(locals.runtime.env);

  return new Response(JSON.stringify(womps), { status: 200 });
};

export const POST: APIRoute = async ({ cookies, locals }) => {
  if (
    !cookies.has("id") ||
    !cookies.has("resetAt") ||
    !cookies.has("triedToIncrement")
  ) {
    return new Response("You must have permission to change the counter!", {
      status: 401,
    });
  }
  if (Number.isNaN(cookies.get("id")!.number()))
    return new Response("Invalid user id", { status: 400 });
  const { env } = locals.runtime;
  const kv = env.WOMP_KV;
  const id = cookies.get("id")!.number();
  const username = await kv.get<string>(`user:${id}`);
  const incrementCount = await kv.get<string>("incrementCount").then((val) => {
    if (!val) return 5;
    return parseInt(val);
  });

  if (!username) {
    return new Response("Invalid user id", { status: 400 });
  }

  const resetAt = compareAsc(new Date(), cookies.get("resetAt")!.value);
  if (resetAt >= 0) {
    cookies.set("triedToIncrement", "0", {
      path: "/",
    });
    cookies.set(
      "resetAt",
      new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString(),
      {
        path: "/",
        expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365),
      },
    );
  }
  if (
    cookies.get("triedToIncrement")!.number() > incrementCount &&
    resetAt == -1 &&
    cookies.get("id")!.number() != 42069
  ) {
    return new Response("You've tried to increment too many times", {
      status: 400,
    });
  }

  const currentQuarter = await kv.get<string>("current_quarter");

  if (!currentQuarter) {
    return new Response("Failed to update counter", { status: 500 });
  }

  cookies.set(
    "triedToIncrement",
    `${(cookies.get("triedToIncrement")?.number() || 0) + 1}`,
    {
      path: "/",
      expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365),
    },
  );

  const db = getDB(env);
  // Figure out how to condense this into a single query
  const batchResponse = await db.batch([
    db
      .insert(Womps)
      .values({
        last_updated: new Date(),
        updated_by: cookies.get("id")!.number(),
        quarter_id: currentQuarter,
      })
      .returning({
        last_updated: Womps.last_updated,
        updated_by: Womps.updated_by,
      }),
    db
      .select({
        total: sql<number>`count(*)`.as("total"),
      })
      .from(Womps)
      .where(eq(Womps.quarter_id, currentQuarter)),
  ]);

  const [data, total] = batchResponse;

  if (!data || !total) {
    return new Response("Failed to update counter", { status: 500 });
  }

  const resolved_username = await resolveUsernameFromId(data[0].updated_by, kv);
  cookies.set("resolved_username", resolved_username, {
    path: "/",
  });
  return new Response(
    JSON.stringify({
      last_updated: data[0].last_updated.toISOString(),
      updated_by: data[0].updated_by,
      total: total[0].total,
      resolved_username,
      current_quarter: currentQuarter,
    }),
    { status: 201 },
  );
};
