import type { APIRoute } from "astro";
import {Womps, db, eq} from "astro:db";

export const GET: APIRoute = async ({}) => {
    const womps = (await db.select().from(Womps))[0];

    if (womps) {
        return new Response(JSON.stringify({
            total: womps.total,
            lastUpdated: womps.lastUpdated.toISOString()
        }), {status: 200});
    } else {
        await db.insert(Womps).values({
            lastUpdated: new Date(),
            total: 0,
            id: 1
        });
        return new Response(JSON.stringify({
            total: 0,
            lastUpdated: new Date().toISOString()
        }));
    }
};

export const PATCH: APIRoute = async ({request}) => {
    const lastUpdated = new Date();
    let data = await db.select({
        old_total: Womps.total,
    }).from(Womps).where(eq(Womps.id, 1));

    await db.update(Womps).set({
        lastUpdated: lastUpdated,
        total: data[0].old_total + 1,
    }).where(eq(Womps.id, 1));

    return new Response(JSON.stringify({
        total: data[0].old_total + 1,
        lastUpdated: lastUpdated.toISOString()
    }), {status: 201});
}