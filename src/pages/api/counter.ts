import type { APIRoute } from "astro";
import {Womps, db, eq} from "astro:db";
import { compareAsc } from "date-fns";

export const prerendered = false;

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

export const PATCH: APIRoute = async ({cookies}) => {
    if (!cookies.has('id')) {
        return new Response("You must have permission to change the counter!", {status: 401});
    }
    let resetAt = compareAsc(new Date(), cookies.get('resetAt')!.value);
    if (resetAt >= 0) {
        cookies.set('triedToIncrement', '0', {
            path: '/',
        
        });
        cookies.set('resetAt', new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toISOString(), {
            path: '/',
        });
    }
    if (cookies.get('triedToIncrement')!.number() > 5 && resetAt == -1) {
        return new Response("You've tried to increment too many times", {status: 400});
    }
    
    cookies.set('triedToIncrement', `${(cookies.get('triedToIncrement')?.number() || 0) + 1}`, {
        path: '/',
    });

    const lastUpdated = new Date();
    let data = await db.select({
        old_total: Womps.total,
    }).from(Womps).where(eq(Womps.id, 1));

    await db.update(Womps).set({
        lastUpdated: lastUpdated,
        total: data[0].old_total + 1,
        updated_by: cookies.get('id')!.number()
    }).where(eq(Womps.id, 1));

    return new Response(JSON.stringify({
        total: data[0].old_total + 1,
        lastUpdated: lastUpdated.toISOString()
    }), {status: 201});
}