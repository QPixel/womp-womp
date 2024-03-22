import { createClient } from "@vercel/kv";
import type { APIRoute } from "astro";
import { Womps, db, eq, sql } from "astro:db";
import { compareAsc } from "date-fns";

export const prerendered = false;

// const wompCount = db.select({
//     id: Womps.id,
//     total: sql<number>`cast(count(*) as int)`.as("total"),
// }).from(Womps).groupBy(Womps.id).as("wompCount");

const { REDIS_REST_API_URL, REDIS_REST_API_TOKEN } = import.meta.env;
 
const kv = createClient({
  url: REDIS_REST_API_URL,
  token: REDIS_REST_API_TOKEN,
});

export const GET: APIRoute = async ({ }) => {
    let wompQuery = db.select({
        max_date: sql<Date>`max(last_updated)`.as("max_date"),
        total: sql<number>`count(*)`.as("total"),
    }).from(Womps).as("wompQuery");

    let womps = await db.select({
        updated_by: Womps.updated_by,
        last_updated: Womps.last_updated,
        total: sql<number>`wompQuery.total`,
    }).from(wompQuery).innerJoin(Womps, eq(Womps.last_updated, wompQuery.max_date)).limit(1);
    if (!womps || womps.length == 0 || !womps[0].last_updated) {
        return new Response(
            JSON.stringify({
                lastUpdated: new Date().toISOString(),
                updatedBy: 0,
                total: 0,
                resolved_username: "Unknown",
            }),
            { status: 201 }
        );
    }
    const username = await kv.get<string>(`user:${womps[0].updated_by}`);
    const resolved_username = username ? username : "Unknown";

    return new Response(
        JSON.stringify({
            total: womps[0].total,
            lastUpdated: womps[0].last_updated.toISOString(),
            updatedBy: womps[0].updated_by,
            resolved_username
        }),
        { status: 200 }
    );
};

export const POST: APIRoute = async ({ cookies }) => {
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

    const id = cookies.get("id")!.number();
    if (await kv.exists(`user:${id}`) !== 1 && id != 42069) {
        return new Response("User not found", { status: 404 });
    }

    let resetAt = compareAsc(new Date(), cookies.get("resetAt")!.value);
    if (resetAt >= 0) {
        cookies.set("triedToIncrement", "0", {
            path: "/",
        });
        cookies.set(
            "resetAt",
            new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString(),
            {
                path: "/",
            }
        );
    }
    if (
        cookies.get("triedToIncrement")!.number() > 5 &&
        resetAt == -1 &&
        cookies.get("id")!.number() != 42069
    ) {
        return new Response("You've tried to increment too many times", {
            status: 400,
        });
    }

    cookies.set(
        "triedToIncrement",
        `${(cookies.get("triedToIncrement")?.number() || 0) + 1}`,
        {
            path: "/",
        }
    );

    // Figure out how to condense this into a single query
    let data = await db
        .insert(Womps)
        .values({
            last_updated: new Date(),
            updated_by: cookies.get("id")!.number(),
        })
        .returning({
            last_updated: Womps.last_updated,
            updated_by: Womps.updated_by,
        });
    let total = (
        await db
            .select({ total: sql<number>`cast(count(*) as int)`.as("total") })
            .from(Womps)
            .limit(1)
    ).at(0);


    if (!data || !total) {
        return new Response("Failed to update counter", { status: 500 });
    }

    return new Response(
        JSON.stringify({
            lastUpdated: data[0].last_updated.toISOString(),
            updatedBy: data[0].updated_by,
            total: total.total,
        }),
        { status: 201 }
    );
};
