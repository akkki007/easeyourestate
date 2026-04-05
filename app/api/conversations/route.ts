import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAuth } from "@/lib/auth/auth";
import Conversation from "@/lib/db/models/Conversation";
import Message from "@/lib/db/models/Message";
import User from "@/lib/db/models/User";
import mongoose from "mongoose";

// GET /api/conversations — list all conversations for logged-in user
export async function GET(req: NextRequest) {
    const user = await requireAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const conversations = await Conversation.find({
        participants: user._id,
    })
        .sort({ lastMessageAt: -1 })
        .populate("participants", "name avatar role")
        .populate("propertyId", "title slug media location")
        .lean();

    return NextResponse.json({ conversations });
}

// POST /api/conversations — create or return existing conversation
export async function POST(req: NextRequest) {
    const user = await requireAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { recipientId: string; propertyId?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { recipientId, propertyId } = body;

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
        return NextResponse.json({ error: "Invalid recipientId" }, { status: 400 });
    }

    await dbConnect();

    // Check recipient exists
    const recipient = await User.findById(recipientId).select("_id name").lean();
    if (!recipient) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });

    // Find existing conversation between these two users for this property
    const query: any = {
        participants: { $all: [user._id, new mongoose.Types.ObjectId(recipientId)] },
    };
    if (propertyId && mongoose.Types.ObjectId.isValid(propertyId)) {
        query.propertyId = new mongoose.Types.ObjectId(propertyId);
    }

    let conversation = await Conversation.findOne(query)
        .populate("participants", "name avatar role")
        .populate("propertyId", "title slug media location");

    if (!conversation) {
        const newConv: any = {
            participants: [user._id, new mongoose.Types.ObjectId(recipientId)],
            unreadCount: {},
        };
        if (propertyId && mongoose.Types.ObjectId.isValid(propertyId)) {
            newConv.propertyId = new mongoose.Types.ObjectId(propertyId);
        }
        conversation = await Conversation.create(newConv);
        conversation = await Conversation.findById(conversation._id)
            .populate("participants", "name avatar role")
            .populate("propertyId", "title slug media location");
    }

    return NextResponse.json({ conversation });
}