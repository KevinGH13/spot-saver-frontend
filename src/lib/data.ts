import { eq } from "drizzle-orm";
import { db } from "./db";
import { spots } from "./schema";
import { Spot, CreateSpotInput, UpdateSpotInput } from "@/types/spot";

function toSpot(row: typeof spots.$inferSelect): Spot {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    url: row.url ?? undefined,
    address: row.address ?? undefined,
    lat: row.lat,
    lng: row.lng,
    tags: row.tags,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getSpots(): Promise<Spot[]> {
  const rows = await db.query.spots.findMany({
    orderBy: (spots, { desc }) => [desc(spots.createdAt)],
  });
  return rows.map(toSpot);
}

export async function getSpot(id: string): Promise<Spot | null> {
  const row = await db.query.spots.findFirst({
    where: eq(spots.id, id),
  });
  return row ? toSpot(row) : null;
}

export async function createSpot(input: CreateSpotInput): Promise<Spot> {
  const [row] = await db.insert(spots).values(input).returning();
  return toSpot(row);
}

export async function updateSpot(
  id: string,
  input: UpdateSpotInput
): Promise<Spot | null> {
  const [row] = await db
    .update(spots)
    .set(input)
    .where(eq(spots.id, id))
    .returning();
  return row ? toSpot(row) : null;
}

export async function deleteSpot(id: string): Promise<boolean> {
  const [row] = await db
    .delete(spots)
    .where(eq(spots.id, id))
    .returning({ id: spots.id });
  return !!row;
}
