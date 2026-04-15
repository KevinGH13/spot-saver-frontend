import { NextRequest, NextResponse } from "next/server";
import { getSpot, updateSpot, deleteSpot } from "@/lib/data";
import { UpdateSpotInput } from "@/types/spot";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const spot = await getSpot(id);
  if (!spot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(spot);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body: UpdateSpotInput = await request.json();
  const spot = await updateSpot(id, body);
  if (!spot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(spot);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const deleted = await deleteSpot(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
