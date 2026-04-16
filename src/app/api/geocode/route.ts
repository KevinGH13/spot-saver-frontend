import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 3) {
    return NextResponse.json([]);
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", q);
  url.searchParams.set("key", process.env.GOOGLE_MAPS_KEY ?? "");
  url.searchParams.set("language", "es");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();
    if (data.status !== "OK") return NextResponse.json([]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (data.results as any[]).slice(0, 5).map((r) => ({
      place_id: r.place_id,
      display_name: r.formatted_address,
      lat: String(r.geometry.location.lat),
      lon: String(r.geometry.location.lng),
    }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
