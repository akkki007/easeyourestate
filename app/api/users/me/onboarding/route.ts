import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import User from "@/lib/db/models/User";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
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

  let updated = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      role,
      ...(onboardingData && Object.keys(onboardingData).length > 0 ? { onboardingData } : {}),
    },
    { new: true, runValidators: true }
  );

  if (!updated) {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const primaryEmail = clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress
      ?? clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    updated = await User.create({
      clerkId: userId,
      email: primaryEmail,
      name: { first: clerkUser.firstName ?? "", last: clerkUser.lastName ?? "" },
      avatar: clerkUser.imageUrl ?? undefined,
      role,
      onboardingData: onboardingData ?? {},
    });
  }

  return NextResponse.json({ ok: true, user: { id: updated._id, role: updated.role } });
}
