import { z } from "zod";

const purposeEnum = z.enum(["sell", "rent", "lease", "pg"]);
const categoryEnum = z.enum(["residential", "commercial"]);
const propertyTypeResidential = z.enum(["flat", "villa", "plot", "house", "penthouse", "pg"]);
const propertyTypeCommercial = z.enum(["office", "shop", "warehouse", "showroom"]);
const propertyTypeEnum = z.union([propertyTypeResidential, propertyTypeCommercial]);

const priceSchema = z.object({
  amount: z.number().positive(),
  currency: z.literal("INR").default("INR"),
  pricePerSqft: z.number().positive().optional(),
  negotiable: z.boolean().default(false),
  maintenance: z.number().min(0).optional(),
  deposit: z.number().min(0).optional(),
});

const areaSchema = z.object({
  superBuiltUp: z.number().positive().optional(),
  builtUp: z.number().positive().optional(),
  carpet: z.number().positive().optional(),
  plot: z.number().positive().optional(),
  unit: z.enum(["sqft", "sqm", "sqyd"]).default("sqft"),
});

const specsSchema = z.object({
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  balconies: z.number().min(0).optional(),
  totalFloors: z.number().min(0).optional(),
  floorNumber: z.number().min(0).optional(),
  facing: z.enum(["north", "south", "east", "west", "ne", "nw", "se", "sw"]).optional(),
  furnishing: z.enum(["unfurnished", "semi", "fully"]).default("unfurnished"),
  parking: z.object({ covered: z.number().min(0).default(0), open: z.number().min(0).default(0) }).default({ covered: 0, open: 0 }),
  area: areaSchema.optional(),
  age: z.string().optional(),
  possessionStatus: z.enum(["ready", "under_construction"]).default("ready"),
  possessionDate: z.coerce.date().optional(),
  reraId: z.string().optional(),
});

const addressSchema = z.object({
  line1: z.string().min(5),
  line2: z.string().optional(),
  landmark: z.string().optional(),
});

const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const locationSchema = z.object({
  address: addressSchema,
  locality: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  coordinates: coordinatesSchema,
});

const rentalDetailsSchema = z.object({
  monthly_rent: z.number().positive(),
  security_deposit: z.number().nonnegative(),
  maintenance: z.number().nonnegative().optional(),
  lock_in_period: z.string().optional(),
  available_from: z.coerce.date(),
  pet_friendly: z.boolean().default(false),
  preferred_tenants: z.array(z.string()).default([]),
});

const pgDetailsSchema = z.object({
  monthly_rent: z.number().positive(),
  security_deposit: z.number().nonnegative(),
  sharing_type: z.array(z.string()).min(1),
  meals_included: z.boolean().default(false),
  gender_preference: z.enum(["Male", "Female", "Any"]),
  rules: z.array(z.string()).default([]),
});

export const createPropertySchema = z.object({
  purpose: purposeEnum,
  category: categoryEnum,
  propertyType: propertyTypeEnum,
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  price: priceSchema.optional(),
  specs: specsSchema.default({ furnishing: "unfurnished", parking: { covered: 0, open: 0 }, possessionStatus: "ready" }),
  amenities: z.array(z.string()).max(30).default([]),
  location: locationSchema,
  media: z
    .object({
      images: z
        .array(
          z.object({
            url: z.string().min(1),
            publicId: z.string(),
            caption: z.string().optional(),
            isPrimary: z.boolean().default(false),
            order: z.number().default(0),
          })
        )
        .max(20)
        .default([]),
    })
    .default({ images: [] }),
  rental_details: rentalDetailsSchema.optional(),
  pg_details: pgDetailsSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.purpose === "rent" || data.purpose === "lease") {
    if (!data.rental_details) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rental details are required when purpose is 'rent' or 'lease'",
        path: ["rental_details"],
      });
    }
  } else if (data.purpose === "pg") {
    if (!data.pg_details) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PG details are required when purpose is 'pg'",
        path: ["pg_details"],
      });
    }
  } else if (data.purpose === "sell") {
    if (!data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price details are required when purpose is 'sell'",
        path: ["price"],
      });
    }
  }
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
