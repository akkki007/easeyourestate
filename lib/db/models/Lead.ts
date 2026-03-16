import mongoose, { Schema, Document, Model } from "mongoose";

interface IMessage {
  senderId: mongoose.Types.ObjectId;
  text: string;
  sentAt: Date;
}

export interface ILead extends Document {
  buyerId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  message: string;
  intent: "buy" | "visit" | "info";
  status: "open" | "closed" | "converted" | "pending" | "contacted" | "visited";
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
    buyerId: {
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

    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    intent: {
      type: String,
      enum: ["buy", "visit", "info"],
      default: "info",
    },

    status: {
      type: String,
      enum: ["open", "closed", "converted", "pending", "contacted", "visited"],
      default: "pending",
    },

    messages: [MessageSchema],
  },
  { timestamps: true }
);

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;