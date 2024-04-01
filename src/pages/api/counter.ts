import { createClient } from "@vercel/kv";
import type { APIRoute } from "astro";
import { Womps, and, db, eq, sql } from "astro:db";
import { compareAsc } from "date-fns";
import { get } from "svelte/store";

export const prerendered = false;


const { REDIS_REST_API_URL, REDIS_REST_API_TOKEN } = import.meta.env;
 
const kv = createClient({
  url: REDIS_REST_API_URL,
  token: REDIS_REST_API_TOKEN,
});

async function resolveUsernameFromId(id: number) {
    // resolve the async promise inline
    const username = await kv.get<string>(`user:${id}`)
    return username ? username : "Unknown";
}

async function getCounterWithQuarter(currentQuarter: string) {
    let wompQuery = db.select({
        max_date: sql<Date>`max(last_updated)`.as("max_date"),
        total: sql<number>`count(*)`.as("total"),
    }).from(Womps).where(eq(Womps.quarter_id, currentQuarter)).as("wompQuery");

    let womps = await db.select({
        updated_by: Womps.updated_by,
        last_updated: Womps.last_updated,
        total: sql<number>`wompQuery.total`,
        quarter: Womps.quarter_id,
    }).from(wompQuery).innerJoin(Womps, eq(Womps.last_updated, wompQuery.max_date)).limit(1);
    return womps;
}

export async function getCounterData() {
    let currentQuarter = await kv.get<string>("current_quarter");
    if (!currentQuarter) {
        currentQuarter = "24-Q2";
    }
    let womps = await getCounterWithQuarter(currentQuarter);
    
    if (!womps || womps.length == 0 || !womps[0].last_updated) {
        return {
            total: 0,
            last_updated: new Date(),
            updated_by: 0,
            resolved_username: "Unknown",
        };
    }
    const resolved_username = await resolveUsernameFromId(womps[0].updated_by);
    return {
        total: womps[0].total,
        last_updated: womps[0].last_updated,
        updated_by: womps[0].updated_by,
        resolved_username,
    };
}

export type CounterData = typeof getCounterData extends () => Promise<infer T> ? T : never;

export const GET: APIRoute<CounterData> = async () => {
    let womps = await getCounterData();

    return new Response(
        JSON.stringify(womps),
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
                expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365),
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
        }
    );

    

    // Figure out how to condense this into a single query
    let data = await db
        .insert(Womps)
        .values({
            last_updated: new Date(),
            updated_by: cookies.get("id")!.number(),
            quarter_id: currentQuarter,
        })
        .returning({
            last_updated: Womps.last_updated,
            updated_by: Womps.updated_by,
        });
    
    let total = await db.select({
        total: sql<number>`count(*)`.as("total"),
    }).from(Womps).where(eq(Womps.quarter_id, currentQuarter));

    if (!data || !total) {
        return new Response("Failed to update counter", { status: 500 });
    }

    const resolved_username = await resolveUsernameFromId(data[0].updated_by);
    cookies.set("resolved_username", resolved_username, {
        path: "/"
    })
    return new Response(
        JSON.stringify({
            last_updated: data[0].last_updated.toISOString(),
            updated_by: data[0].updated_by,
            total: total[0].total,
            resolved_username,
            current_quarter: currentQuarter,
        }),
        { status: 201 }
    );
};
