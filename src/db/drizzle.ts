import { drizzle } from "drizzle-orm/d1";
import type { ENV } from "src/env";

import { womps } from "./schema";

export const schema = {...womps};

export const getDB = (env: ENV) => {
    return drizzle(env.WOMP_DB, {
        schema
    });
}
