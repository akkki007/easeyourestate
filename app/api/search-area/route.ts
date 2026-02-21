import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SearchArea from "@/models/SearchArea";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const { userId, lat, lng, radius } = body;

    if (!userId || !lat || !lng || !radius) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const geoResponse = await fetch(
       `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
       {
        headers : {
          "User-Agent" : "easeyourstate-app"
        }
       }
    );

    const geoData = await geoResponse.json();

    const areaName = 
      geoData?.address?.suburb ||
      geoData?.address?.neighbourhodd ||
      geoData?.address?.city ||
      geoData?.address?.town ||
      geoData?.address?.village ||
      "";


    const area = await SearchArea.create({
      userId,
      searchArea: {
        lat,
        lng,
        radius,
      },
      areaName,
    });

    return NextResponse.json(
      { success: true, data: area },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
