import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    propertyId?: mongoose.Types.ObjectId;
    lastMessage?: string;
    lastMessageAt?: Date;
    unreadCount: Map<string, number>;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
    {
        participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
        propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
        lastMessage: { type: String },
        lastMessageAt: { type: Date },
        unreadCount: { type: Map, of: Number, default: {} },
    },
    { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

const Conversation: Model<IConversation> =
    mongoose.models.Conversation ||
    mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;