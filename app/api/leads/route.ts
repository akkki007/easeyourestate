import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAuth } from "@/lib/auth/auth";
import Lead from "@/lib/db/models/Lead";
import Property from "@/lib/db/models/Property";
import { isValidObjectId } from "@/lib/helpers/sanitize";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, name, phone, message, intent } = body;

    if (!propertyId || !name || !phone || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isValidObjectId(propertyId)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    if (typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (typeof message !== "string" || message.length > 2000) {
      return NextResponse.json({ error: "Message too long (max 2000 chars)" }, { status: 400 });
    }

    await dbConnect();

    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const lead = await Lead.create({
      buyerId: user._id,
      ownerId: property.listedBy,
      recipientId: property.listedBy,
      recipientRole: property.listingType,
      assignedToUserId: property.listedBy,
      propertyId,
      name: String(name).trim().slice(0, 200),
      phone,
      message: message.trim().slice(0, 2000),
      intent: intent || "info",
      status: "new",
      statusHistory: [
        {
          status: "new",
          changedBy: user._id,
          note: "Lead created",
          changedAt: new Date(),
        },
      ],
      messages: [
        {
          senderId: user._id,
          text: message.trim().slice(0, 2000),
          sentAt: new Date(),
        },
      ],
    });

    await Property.updateOne({ _id: propertyId }, { $inc: { "metrics.inquiries": 1 } });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const leads = await Lead.find({ buyerId: user._id })
      .populate("propertyId", "title location price media")
      .sort({ createdAt: -1 });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
