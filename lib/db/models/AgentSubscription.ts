import mongoose, { Schema, model, models } from "mongoose";

const usageSchema = new Schema(
  {
    listings: { type: Number, default: 0 },
    teamSeats: { type: Number, default: 0 },
    featuredSlots: { type: Number, default: 0 },
  },
  { _id: false }
);

const agentSubscriptionSchema = new Schema(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    planCode: {
      type: String,
      enum: ["free", "basic", "pro", "premium"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "expired"],
      default: "active",
    },
    listingLimit: { type: Number, default: 1 },
    teamSeatLimit: { type: Number, default: 1 },
    featuredSlotLimit: { type: Number, default: 0 },
    bulkUploadEnabled: { type: Boolean, default: false },
    usage: { type: usageSchema, default: () => ({}) },
    startsAt: { type: Date, default: () => new Date() },
    endsAt: { type: Date, required: false },
    autoRenew: { type: Boolean, default: true },
    cancellationReason: String,
    cancelledAt: Date,
  },
  { timestamps: true }
);

agentSubscriptionSchema.index({ agentId: 1 });

export interface IAgentSubscription {
  _id: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  planCode: "free" | "basic" | "pro" | "premium";
  status: "active" | "inactive" | "suspended" | "expired";
  listingLimit: number;
  teamSeatLimit: number;
  featuredSlotLimit: number;
  bulkUploadEnabled: boolean;
  usage?: {
    listings: number;
    teamSeats: number;
    featuredSlots: number;
  };
  startsAt: Date;
  endsAt?: Date;
  autoRenew: boolean;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default models.AgentSubscription ?? model<IAgentSubscription>("AgentSubscription", agentSubscriptionSchema);
