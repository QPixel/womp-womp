import { column, defineDb, defineTable } from 'astro:db';

const Womps = defineTable({
  columns: {
    lastUpdated: column.date({default: new Date()}),
    total: column.number(),
    id: column.number({primaryKey: true}),
  }
})
// https://astro.build/db/config
export default defineDb({
  tables: {
    Womps,
  }
});
