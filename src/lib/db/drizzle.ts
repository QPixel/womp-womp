import { drizzle } from "drizzle-orm/d1";
import { Womps } from "./schema.js";
import type { ENV } from "../../app.js";



export const schema = { ...Womps };

export const getDB = (env: ENV) => {
  return drizzle(env.WOMP_DB, {
    schema,
  });
};
