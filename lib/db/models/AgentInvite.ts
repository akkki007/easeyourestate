import mongoose, { Schema, model, models } from "mongoose";

const agentInviteSchema = new Schema(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invitedAt: { type: Date, default: () => new Date() },
    acceptedAt: Date,
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
  },
  { timestamps: true }
);

agentInviteSchema.index({ agentId: 1, email: 1 });
agentInviteSchema.index({ token: 1 });
agentInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for cleanup

export interface IAgentInvite {
  _id: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  email: string;
  token: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  role: "admin" | "editor" | "viewer";
  invitedBy: mongoose.Types.ObjectId;
  invitedAt: Date;
  acceptedAt?: Date;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default models.AgentInvite ?? model<IAgentInvite>("AgentInvite", agentInviteSchema);
