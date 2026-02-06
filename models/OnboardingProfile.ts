import mongoose, { Schema, model, models } from "mongoose";

/** Role-specific answer keys. Add fields as needed per role. */
export interface ITenantAnswers {
  preferredLocations?: string;
  budgetMin?: number;
  budgetMax?: number;
  moveInDate?: string;
  numberOfOccupants?: number;
  petFriendly?: boolean;
  additionalNotes?: string;
}

export interface IOwnerAnswers {
  propertyType?: string;
  listingType?: "rent" | "sale" | "both";
  propertyAddress?: string;
  city?: string;
  availabilityDate?: string;
  additionalNotes?: string;
}

export interface IAgentAnswers {
  agencyName?: string;
  licenseNumber?: string;
  areasServed?: string;
  yearsExperience?: number;
  specialties?: string;
  additionalNotes?: string;
}

export type RoleAnswers = ITenantAnswers | IOwnerAnswers | IAgentAnswers;

export interface IOnboardingProfile {
  clerkUserId: string;
  role: "tenant" | "owner" | "agent";
  answers: RoleAnswers;
  completedAt: Date;
  updatedAt: Date;
}

const OnboardingProfileSchema = new Schema<IOnboardingProfile>(
  {
    clerkUserId: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ["tenant", "owner", "agent"] },
    answers: { type: Schema.Types.Mixed, required: true, default: {} },
    completedAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

OnboardingProfileSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const OnboardingProfile =
  models?.OnboardingProfile ??
  model<IOnboardingProfile>("OnboardingProfile", OnboardingProfileSchema);

export default OnboardingProfile;
