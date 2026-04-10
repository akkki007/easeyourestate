import mongoose, { Schema, Document, Model } from "mongoose";

interface IMessage {
  senderId: mongoose.Types.ObjectId;
  text: string;
  sentAt: Date;
}

interface ILeadNote {
  authorId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

interface ILeadStatusHistory {
  status: string;
  changedBy: mongoose.Types.ObjectId;
  note?: string;
  changedAt: Date;
}

export interface ILead extends Document {
  buyerId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  recipientRole?: "owner";
  assignedToUserId?: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  message: string;
  intent: "buy" | "visit" | "info";
  status:
    | "new"
    | "contacted"
    | "follow_up"
    | "visited"
    | "converted"
    | "lost"
    | "open"
    | "closed"
    | "pending";
  notes: ILeadNote[];
  statusHistory: ILeadStatusHistory[];
  followUpDate?: string;
  lastContactedAt?: Date;
  convertedAt?: Date;
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

const LeadNoteSchema = new Schema<ILeadNote>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const LeadStatusHistorySchema = new Schema<ILeadStatusHistory>(
  {
    status: {
      type: String,
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: String,
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

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

    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    recipientRole: {
      type: String,
      enum: ["owner"],
    },

    assignedToUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
      enum: ["new", "contacted", "follow_up", "visited", "converted", "lost", "open", "closed", "pending"],
      default: "new",
    },

    notes: {
      type: [LeadNoteSchema],
      default: [],
    },

    statusHistory: {
      type: [LeadStatusHistorySchema],
      default: [],
    },

    followUpDate: {
      type: String,
    },

    lastContactedAt: {
      type: Date,
    },

    convertedAt: {
      type: Date,
    },

    messages: [MessageSchema],
  },
  { timestamps: true }
);

LeadSchema.index({ recipientId: 1, createdAt: -1 });
LeadSchema.index({ assignedToUserId: 1, createdAt: -1 });
LeadSchema.index({ propertyId: 1, createdAt: -1 });

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;
