import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import User from "@/lib/db/models/User";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  let evt: { type: string; data: Record<string, unknown> };
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = evt;
  if (type !== "user.created" && type !== "user.updated" && type !== "user.deleted") {
    return NextResponse.json({ ok: true });
  }

  const clerkId = data.id as string;
  const emailAddresses = (data.email_addresses as Array<{ email_address: string; id: string }>) ?? [];
  const primaryEmail = emailAddresses.find((e: { id: string }) => e.id === data.primary_email_address_id)?.email_address
    ?? emailAddresses[0]?.email_address
    ?? "";
  const firstName = (data.first_name as string) ?? "";
  const lastName = (data.last_name as string) ?? "";
  const imageUrl = (data.image_url as string) ?? "";
  const unsafeMetadata = (data.unsafe_metadata as Record<string, unknown>) ?? {};
  const role = (unsafeMetadata.role as string) || "buyer";

  await dbConnect();

  if (type === "user.deleted") {
    await User.findOneAndUpdate(
      { clerkId },
      { deletedAt: new Date() },
      { new: true }
    );
    return NextResponse.json({ ok: true });
  }

  await User.findOneAndUpdate(
    { clerkId },
    {
      clerkId,
      email: primaryEmail,
      name: { first: firstName, last: lastName },
      avatar: imageUrl || undefined,
      role: ["buyer", "owner", "agent", "builder", "admin"].includes(role) ? role : "buyer",
    },
    { upsert: true, new: true, runValidators: true }
  );

  return NextResponse.json({ ok: true });
}
