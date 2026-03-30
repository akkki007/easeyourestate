import mongoose, { Schema, model, models } from "mongoose";

const socialLinksSchema = new Schema(
  {
    website: String,
    instagram: String,
    facebook: String,
    linkedin: String,
    youtube: String,
  },
  { _id: false }
);

const officeAddressSchema = new Schema(
  {
    line1: String,
    line2: String,
    locality: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false }
);

const ratingSnapshotSchema = new Schema(
  {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

const agentProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    slug: { type: String, required: true, unique: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    agencyName: { type: String, trim: true },
    bio: { type: String, default: "" },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    avatar: String,
    bannerImage: String,
    experienceYears: { type: Number, min: 0, default: 0 },
    serviceAreas: { type: [String], default: [] },
    specialties: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    officeAddress: { type: officeAddressSchema, default: () => ({}) },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    isPublic: { type: Boolean, default: true },
    ratingSnapshot: { type: ratingSnapshotSchema, default: () => ({}) },
  },
  { timestamps: true }
);

agentProfileSchema.index({ slug: 1 }, { unique: true });

export interface IAgentProfile {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  slug: string;
  displayName: string;
  agencyName?: string;
  bio?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  bannerImage?: string;
  experienceYears: number;
  serviceAreas: string[];
  specialties: string[];
  languages: string[];
  officeAddress?: {
    line1?: string;
    line2?: string;
    locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  socialLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
  };
  isPublic: boolean;
  ratingSnapshot?: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default models.AgentProfile ?? model<IAgentProfile>("AgentProfile", agentProfileSchema);
