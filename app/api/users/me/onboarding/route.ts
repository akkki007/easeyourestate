import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import { requireAuth } from "@/lib/auth/auth";

export async function POST(req: NextRequest) {
  const authUser = await requireAuth(req);
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { role: string; onboardingData?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { role, onboardingData } = body;
  if (!role || !["buyer", "owner", "agent", "builder"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await dbConnect();

  const updated = await User.findByIdAndUpdate(
    authUser._id,
    {
      role,
      ...(onboardingData && Object.keys(onboardingData).length > 0 ? { onboardingData } : {}),
    },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, user: { id: updated._id, role: updated.role } });
}
