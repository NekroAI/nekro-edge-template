import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";

export const features = sqliteTable(
  "features",
  {
    id: integer("id").primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  },
  (table) => ({
    keyIdx: unique("features_key_idx").on(table.key),
  }),
);
