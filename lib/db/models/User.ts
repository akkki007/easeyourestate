import mongoose, { Schema, model, models } from "mongoose";

export type UserRole = "buyer" | "tenant" | "owner" | "agent" | "builder" | "admin";

const nameSchema = new Schema(
  { first: { type: String, required: true }, last: { type: String, default: "" } },
  { _id: false }
);

const notificationPrefsSchema = new Schema(
  {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
  },
  { _id: false }
);

const preferencesSchema = new Schema(
  {
    savedSearches: [{ name: String, filters: Schema.Types.Mixed, alertEnabled: Boolean, createdAt: Date }],
    favoriteProperties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    notificationPrefs: { type: notificationPrefsSchema, default: () => ({}) },
  },
  { _id: false }
);

const metaSchema = new Schema(
  {
    lastLoginAt: Date,
    loginCount: { type: Number, default: 0 },
    source: String,
  },
  { _id: false }
);

// Role-specific onboarding data from RoleInfoForm (flexible key-value)
const onboardingDataSchema = new Schema({}, { strict: false, _id: false });

const userSchema = new Schema(
  {

    email: { type: String, sparse: true, unique: true },
    phone: { type: String, sparse: true, unique: true },
    name: { type: nameSchema, required: true },
    avatar: String,
    password: {
      type: String,
      minlength: 6,
      select: false
  },
    role: {
      type: String,
      enum: ["buyer", "tenant", "owner", "agent", "builder", "admin"],
      required: true,
      default: "buyer",
    },
    onboardingData: { type: onboardingDataSchema, default: () => ({}) },
    preferences: { type: preferencesSchema, default: () => ({}) },
    meta: { type: metaSchema, default: () => ({}) },
    isSuspended: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  phone?: string;
  name: { first: string; last: string };
  avatar?: string;
  role: UserRole;
  onboardingData?: Record<string, string>;
  preferences?: {
    savedSearches?: Array<{ name: string; filters: object; alertEnabled: boolean; createdAt: Date }>;
    favoriteProperties?: mongoose.Types.ObjectId[];
    notificationPrefs?: { email?: boolean; sms?: boolean; whatsapp?: boolean; push?: boolean };
  };
  meta?: { lastLoginAt?: Date; loginCount?: number; source?: string };
  isSuspended: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default models.User ?? model<IUser>("User", userSchema);
