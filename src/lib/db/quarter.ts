import type { ENV } from "../../app";
import { getDB } from "./drizzle";
import { Womps } from "./schema";

export async function getQuarters(env: ENV) {
    const { WOMP_KV: kv } = env;
    const db = getDB(env);
    const quartersData = await db
        .select({
            quarter_id: Womps.quarter_id,
        })
        .from(Womps);
    const quarters = new Set(quartersData.map((quarter) => quarter.quarter_id));
    const currentQuarter = await kv.get<string>("current_quarter");
    if (currentQuarter) {
        // make the current quarter the first in the list
        const quartersArr = Array.from(quarters).sort((a, b) =>
            a === currentQuarter ? -1 : b === currentQuarter ? 1 : 0,
        );
        quartersArr.push("all_time")
        return quartersArr;

    }
    return Array.from(quarters);
}