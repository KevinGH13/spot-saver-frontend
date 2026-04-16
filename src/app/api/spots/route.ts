import { NextRequest, NextResponse } from "next/server";
import { getSpots, createSpot } from "@/lib/data";
import { validateCreate } from "@/lib/validation";

export async function GET() {
  const spots = await getSpots();
  return NextResponse.json(spots);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = validateCreate(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const spot = await createSpot(result.data);
  return NextResponse.json(spot, { status: 201 });
}
