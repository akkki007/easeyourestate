import mongoose, { Schema, model, models } from "mongoose";

const permissionsSchema = new Schema(
  {
    viewListings: { type: Boolean, default: true },
    editListings: { type: Boolean, default: false },
    deleteListings: { type: Boolean, default: false },
    viewLeads: { type: Boolean, default: true },
    updateLeads: { type: Boolean, default: false },
    deleteLeads: { type: Boolean, default: false },
    manageTeam: { type: Boolean, default: false },
  },
  { _id: false }
);

const agentTeamMemberSchema = new Schema(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    memberUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },
    permissions: { type: permissionsSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ["active", "inactive", "removed"],
      default: "active",
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invitedAt: { type: Date, default: () => new Date() },
    joinedAt: Date,
    removedAt: Date,
  },
  { timestamps: true }
);

agentTeamMemberSchema.index({ agentId: 1, memberUserId: 1 }, { unique: true });
agentTeamMemberSchema.index({ agentId: 1 });

export interface IAgentTeamMember {
  _id: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  memberUserId: mongoose.Types.ObjectId;
  role: "admin" | "editor" | "viewer";
  permissions?: {
    viewListings: boolean;
    editListings: boolean;
    deleteListings: boolean;
    viewLeads: boolean;
    updateLeads: boolean;
    deleteLeads: boolean;
    manageTeam: boolean;
  };
  status: "active" | "inactive" | "removed";
  invitedBy: mongoose.Types.ObjectId;
  invitedAt: Date;
  joinedAt?: Date;
  removedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default models.AgentTeamMember ?? model<IAgentTeamMember>("AgentTeamMember", agentTeamMemberSchema);
