import { column, defineDb, defineTable } from 'astro:db';

const Womps = defineTable({
  columns: {
    last_updated: column.date({default: new Date()}),
    id: column.number({primaryKey: true}),
    updated_by: column.number({default: 0}),
  }
})

// https://astro.build/db/config
export default defineDb({
  tables: {
    Womps,
  }
});
