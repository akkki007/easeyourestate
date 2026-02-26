import mongoose, { Schema, Document, Model } from "mongoose";

interface IMessage {
  senderId: mongoose.Types.ObjectId;
  text: string;
  sentAt: Date;
}

export interface ILead extends Document {
  tenantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  status: "open" | "closed" | "converted";
  messages: IMessage[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  sentAt: {
    type: Date,
    default: Date.now,
  },
});

const LeadSchema = new Schema<ILead>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed", "converted"],
      default: "open",
    },

    messages: [MessageSchema],
  },
  { timestamps: true }
);

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;