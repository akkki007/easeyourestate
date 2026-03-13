import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { requireAuth } from "@/lib/auth/auth";

// GET /api/user/profile — Get own profile
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const profile = await User.findById(user._id)
    .select("-password -deletedAt -__v")
    .lean();

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: profile });
}

// PUT /api/user/profile — Update profile (name, email, avatar)
export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  // Name
  if (body.name !== undefined) {
    if (typeof body.name === "object" && body.name !== null) {
      const n = body.name as { first?: string; last?: string };
      if (n.first !== undefined) {
        const first = String(n.first).trim();
        if (!first) {
          return NextResponse.json({ error: "First name is required" }, { status: 400 });
        }
        updates["name.first"] = first;
      }
      if (n.last !== undefined) {
        updates["name.last"] = String(n.last).trim();
      }
    }
  }

  // Email
  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }
    updates.email = email || undefined;
  }

  // Avatar
  if (body.avatar !== undefined) {
    updates.avatar = body.avatar ? String(body.avatar) : undefined;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await User.findByIdAndUpdate(
    user._id,
    { $set: updates },
    { new: true, runValidators: true }
  )
    .select("-password -deletedAt -__v")
    .lean();

  return NextResponse.json({ user: updated });
}
