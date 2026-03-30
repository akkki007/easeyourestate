import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .optional()
  .or(z.literal(""));

const stringArrayField = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => {
    if (Array.isArray(value)) {
      return value.map((item) => item.trim()).filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  });

export const agentProfileUpdateSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  agencyName: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Phone must be a valid 10 digit Indian mobile number")
    .optional()
    .or(z.literal("")),
  email: z.email().trim().optional().or(z.literal("")),
  avatar: optionalUrl,
  bannerImage: optionalUrl,
  experienceYears: z.number().min(0).max(80).optional(),
  serviceAreas: stringArrayField,
  specialties: stringArrayField,
  languages: stringArrayField,
  officeAddress: z
    .object({
      line1: z.string().trim().max(120).optional().or(z.literal("")),
      line2: z.string().trim().max(120).optional().or(z.literal("")),
      locality: z.string().trim().max(80).optional().or(z.literal("")),
      city: z.string().trim().max(80).optional().or(z.literal("")),
      state: z.string().trim().max(80).optional().or(z.literal("")),
      pincode: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Pincode must be 6 digits")
        .optional()
        .or(z.literal("")),
    })
    .optional(),
  socialLinks: z
    .object({
      website: optionalUrl,
      instagram: optionalUrl,
      facebook: optionalUrl,
      linkedin: optionalUrl,
      youtube: optionalUrl,
    })
    .optional(),
  isPublic: z.boolean().optional(),
});

export const agentLeadUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "follow_up", "visited", "converted", "lost"]).optional(),
  note: z.string().trim().min(1).max(1000).optional(),
  followUpDate: z.string().trim().min(1).max(40).optional().or(z.literal("")),
});
