import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import User from "@/lib/db/models/User";

export async function POST(req: NextRequest) {
  await dbConnect();

  const body = await req.json();

  const { userId, lat, lng } = body;

  const user = await User.findByIdAndUpdate(
    userId,
    {
      location: {
        type: "Point",
        coordinates: [lng, lat]
      }
    },
    { new: true }
  );

  return NextResponse.json(user);
}