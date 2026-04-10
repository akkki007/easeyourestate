import { NextRequest, NextResponse } from "next/server";
import { Client } from "@googlemaps/google-maps-services-js";

const mapsClient = new Client({});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");

  if (!placeId) {
    return NextResponse.json(
      { error: "placeId is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await mapsClient.placeDetails({
      params: {
        place_id: placeId,
        key: apiKey,
        fields: [
          "geometry",
          "formatted_address",
          "name",
          "address_components",
        ] as any,
      },
    });

    const { result } = response.data;

    // Extract city, state, locality from address components
    let city = "";
    let state = "";
    let locality = "";
    let pincode = "";

    for (const comp of result.address_components || []) {
      const types = comp.types as string[];
      if (types.includes("locality")) city = comp.long_name;
      if (types.includes("administrative_area_level_1"))
        state = comp.long_name;
      if (
        types.includes("sublocality_level_1") ||
        types.includes("sublocality")
      )
        locality = comp.long_name;
      if (types.includes("postal_code")) pincode = comp.long_name;
    }

    return NextResponse.json({
      name: result.name,
      address: result.formatted_address,
      lat: result.geometry?.location.lat,
      lng: result.geometry?.location.lng,
      city,
      state,
      locality: locality || result.name,
      pincode,
    });
  } catch (err: any) {
    console.error("Place details error:", err.message);
    return NextResponse.json(
      { error: "Place details failed" },
      { status: 500 }
    );
  }
}
