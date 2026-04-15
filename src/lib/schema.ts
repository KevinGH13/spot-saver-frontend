import {
  pgTable,
  pgEnum,
  uuid,
  text,
  doublePrecision,
  timestamp,
} from "drizzle-orm/pg-core";

export const spotCategoryEnum = pgEnum("spot_category", [
  "restaurant",
  "cafe",
  "hotel",
  "bar",
  "other",
]);

export const spots = pgTable("spots", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: spotCategoryEnum("category").notNull(),
  url: text("url"),
  address: text("address"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SpotRow = typeof spots.$inferSelect;
export type NewSpotRow = typeof spots.$inferInsert;
