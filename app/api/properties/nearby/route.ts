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
        $maxDistance: 5000
      }
    }
  }).limit(20);

  const formatted = properties.map((p:any) => ({

    _id: p._id,

    title: p.title,

    price: p.price?.amount,

    locality: p.location?.locality,

    slug: p.slug,

    image: p.media?.images?.[0]?.url,

    lat: p.location?.coordinates?.coordinates?.[1],

    lng: p.location?.coordinates?.coordinates?.[0]

  }));

  return NextResponse.json({ properties: formatted });

}