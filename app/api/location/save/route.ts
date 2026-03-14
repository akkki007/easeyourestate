import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { requireAuth } from "@/lib/auth/auth";

export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const body = await req.json();
  const { lat, lng } = body;

  if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Valid lat and lng are required" }, { status: 400 });
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "lat must be -90..90 and lng must be -180..180" }, { status: 400 });
  }

  // Use authenticated user's ID instead of trusting client-provided userId
  const user = await User.findByIdAndUpdate(
    authUser._id,
    {
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    },
    { new: true }
  ).select("-password -__v");

  return NextResponse.json({ message: "Location saved", user });
}
