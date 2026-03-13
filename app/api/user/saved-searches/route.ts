import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { requireAuth } from "@/lib/auth/auth";
import mongoose from "mongoose";

// GET /api/user/saved-searches — List saved searches
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const dbUser = await User.findById(user._id).select("preferences.savedSearches").lean();
  const savedSearches = dbUser?.preferences?.savedSearches ?? [];

  return NextResponse.json({ savedSearches });
}

// POST /api/user/saved-searches — Save a search query
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  let body: { name?: string; filters?: Record<string, unknown>; alertEnabled?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Search name is required" }, { status: 400 });
  }

  if (!body.filters || Object.keys(body.filters).length === 0) {
    return NextResponse.json({ error: "Filters are required" }, { status: 400 });
  }

  const searchEntry = {
    _id: new mongoose.Types.ObjectId(),
    name,
    filters: body.filters,
    alertEnabled: body.alertEnabled ?? false,
    createdAt: new Date(),
  };

  await User.findByIdAndUpdate(user._id, {
    $push: { "preferences.savedSearches": searchEntry },
  });

  return NextResponse.json({ savedSearch: searchEntry }, { status: 201 });
}
