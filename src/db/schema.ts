import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const Womps = sqliteTable("Womps",{
    last_updated: integer("last_updated", {mode: "timestamp"}).notNull().default(sql`CURRENT_TIMESTAMP`),
    id: integer("id").notNull().primaryKey(),
    updated_by: integer("updated_by").notNull().default(0),
    quarter_id: text("quarter_id").notNull().default("24-Q1"),
})
