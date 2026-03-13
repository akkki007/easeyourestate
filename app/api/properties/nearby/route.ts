import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";

export async function GET(req: NextRequest) {

  await dbConnect();

  const { searchParams } = new URL(req.url);

  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  const properties = await Property.find({
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: 5000 // 5km
      }
    }
  }).limit(20);

  return NextResponse.json({ properties });
}