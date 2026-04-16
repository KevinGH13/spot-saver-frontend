import { NextRequest, NextResponse } from "next/server";
import { getSpot, updateSpot, deleteSpot } from "@/lib/data";
import { validateUpdate } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validId(id: string) {
  return UUID_RE.test(id);
}

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const spot = await getSpot(id);
  if (!spot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(spot);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = validateUpdate(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const spot = await updateSpot(id, result.data);
  if (!spot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(spot);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!validId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const deleted = await deleteSpot(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
