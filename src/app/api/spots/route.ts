import { NextRequest, NextResponse } from "next/server";
import { getSpots, createSpot } from "@/lib/data";
import { CreateSpotInput } from "@/types/spot";

export async function GET() {
  const spots = await getSpots();
  return NextResponse.json(spots);
}

export async function POST(request: NextRequest) {
  const body: CreateSpotInput = await request.json();

  if (!body.name || body.lat == null || body.lng == null || !body.category) {
    return NextResponse.json(
      { error: "name, category, lat and lng are required" },
      { status: 400 }
    );
  }

  const spot = await createSpot(body);
  return NextResponse.json(spot, { status: 201 });
}
