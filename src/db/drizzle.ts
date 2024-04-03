import { drizzle } from "drizzle-orm/d1";
import type { ENV } from "src/env";
import { Womps } from "./schema";

export const schema = { ...Womps };

export const getDB = (env: ENV) => {
  return drizzle(env.WOMP_DB, {
    schema,
  });
};
