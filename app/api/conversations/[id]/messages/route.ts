import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { requireAuth } from "@/lib/auth/auth";
import Conversation from "@/lib/db/models/Conversation";
import Message from "@/lib/db/models/Message";
import mongoose from "mongoose";

type Params = { params: Promise<{ id: string }> };

// GET /api/conversations/[id]/messages — get messages for a conversation
export async function GET(req: NextRequest, { params }: Params) {
    const user = await requireAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    await dbConnect();

    // Verify user is a participant
    const conversation = await Conversation.findOne({
        _id: id,
        participants: user._id,
    });

    if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "name avatar")
        .lean();

    // Mark messages as read
    await Message.updateMany(
        { conversationId: id, receiverId: user._id, read: false },
        { $set: { read: true } }
    );

    // Reset unread count
    await Conversation.findByIdAndUpdate(id, {
        $set: { [`unreadCount.${user._id.toString()}`]: 0 },
    });

    return NextResponse.json({ messages: messages.reverse() });
}

// POST /api/conversations/[id]/messages — send a message
export async function POST(req: NextRequest, { params }: Params) {
    const user = await requireAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    let body: { text: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const text = body.text?.trim();
    if (!text || text.length > 2000) {
        return NextResponse.json({ error: "Message text is required (max 2000 chars)" }, { status: 400 });
    }

    await dbConnect();

    const conversation = await Conversation.findOne({
        _id: id,
        participants: user._id,
    });

    if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Find the receiver (the other participant)
    const receiverId = conversation.participants.find(
        (p) => p.toString() !== user._id.toString()
    );

    if (!receiverId) {
        return NextResponse.json({ error: "Receiver not found" }, { status: 400 });
    }

    const message = await Message.create({
        conversationId: id,
        senderId: user._id,
        receiverId,
        text,
    });

    // Update conversation metadata
    const receiverIdStr = receiverId.toString();
    const currentUnread = (conversation.unreadCount?.get?.(receiverIdStr) as number) || 0;
    await Conversation.findByIdAndUpdate(id, {
        $set: {
            lastMessage: text,
            lastMessageAt: new Date(),
            [`unreadCount.${receiverIdStr}`]: currentUnread + 1,
        },
    });

    // Populate sender info
    const populatedMessage = await Message.findById(message._id)
        .populate("senderId", "name avatar")
        .lean();

    // Emit via Socket.io if available
    const io = (global as any).io;
    if (io) {
        io.to(`conv:${id}`).emit("new_message", {
            conversationId: id,
            message: populatedMessage,
        });

        // Notify receiver even if not in room
        io.to(`user:${receiverIdStr}`).emit("conversation_updated", {
            conversationId: id,
            lastMessage: text,
            lastMessageAt: new Date(),
        });
    }

    return NextResponse.json({ message: populatedMessage }, { status: 201 });
}