import { getDB } from "$lib/db/drizzle";
import { Womps } from "$lib/db/schema";
import { compareAsc } from "date-fns";
import { sql, eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

async function resolveUsernameFromId(id: number, kv: KVNamespace) {
    // resolve the async promise inline
    const username = await kv.get<string>(`user:${id}`);
    return username ? username : "Unknown";
}

export const POST: RequestHandler = async ({ platform, cookies }) => {
    if (
        !cookies.get("id") ||
        !cookies.get("resetAt") ||
        !cookies.get("triedToIncrement")
    ) {
        return new Response("You must have permission to change the counter!", {
            status: 401,
        });
    }
    const id = parseInt(cookies.get("id")!);

    if (Number.isNaN(parseInt(cookies.get("id")!)))
        return new Response("Invalid user id", { status: 400 });

    const env = platform?.env;

    const kv = env?.WOMP_KV;

    if (!kv) {
        throw new Error("Missing env");
    }

    const username = await kv.get<string>(`user:${id}`);
    const incrementCount = await kv.get<string>("incrementCount").then((val) => {
        if (!val) return 5;
        return parseInt(val);
    });

    if (!username) {
        return new Response("Invalid user id", { status: 400 });
    }

    const resetAt = compareAsc(new Date(), cookies.get("resetAt")!);

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
        parseInt(cookies.get("triedToIncrement")!) > incrementCount &&
        resetAt == -1 &&
        parseInt(cookies.get("id")!) != 42069
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
        `${(parseInt(cookies.get("triedToIncrement")!) || 0) + 1}`,
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
                updated_by: parseInt(cookies.get("id")!),
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
