import { NextRequest, NextResponse } from "next/server";
import { Client } from "@googlemaps/google-maps-services-js";

const mapsClient = new Client({});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!query || query.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await mapsClient.placeAutocomplete({
      params: {
        input: query,
        key: apiKey,
        types: "(regions)" as any,
        components: ["country:in"] as any,
        ...(lat && lng
          ? {
              location: {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
              },
              radius: 50000,
            }
          : {}),
      },
    });

    const predictions = response.data.predictions.map((p) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting.main_text,
      secondaryText: p.structured_formatting.secondary_text,
      types: p.types,
    }));

    return NextResponse.json({ predictions });
  } catch (err: any) {
    console.error("Autocomplete error:", err.message);
    return NextResponse.json(
      { error: "Autocomplete failed" },
      { status: 500 }
    );
  }
}
