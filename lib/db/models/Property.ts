import mongoose, { Schema, model, models } from "mongoose";

const addressSchema = new Schema(
  { line1: { type: String, required: true }, line2: String, landmark: String },
  { _id: false }
);

const coordinatesSchema = new Schema(
  { type: { type: String, enum: ["Point"], default: "Point" }, coordinates: { type: [Number], required: true } },
  { _id: false }
);

const locationSchema = new Schema(
  {
    address: { type: addressSchema, required: true },
    locality: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: { type: coordinatesSchema, required: true },
  },
  { _id: false }
);

const priceSchema = new Schema(
  {
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["INR"], default: "INR" },
    pricePerSqft: Number,
    negotiable: { type: Boolean, default: false },
    maintenance: Number,
    deposit: Number,
  },
  { _id: false }
);

const areaSchema = new Schema(
  {
    superBuiltUp: Number,
    builtUp: Number,
    carpet: Number,
    plot: Number,
    unit: { type: String, enum: ["sqft", "sqm", "sqyd"], default: "sqft" },
  },
  { _id: false }
);

const specsSchema = new Schema(
  {
    bedrooms: Number,
    bathrooms: Number,
    balconies: Number,
    totalFloors: Number,
    floorNumber: Number,
    facing: { type: String, enum: ["north", "south", "east", "west", "ne", "nw", "se", "sw"] },
    furnishing: { type: String, enum: ["unfurnished", "semi", "fully"], default: "unfurnished" },
    parking: { covered: { type: Number, default: 0 }, open: { type: Number, default: 0 } },
    area: areaSchema,
    age: String,
    possessionStatus: { type: String, enum: ["ready", "under_construction"], default: "ready" },
    possessionDate: Date,
    reraId: String,
  },
  { _id: false }
);

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    caption: String,
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const mediaSchema = new Schema(
  {
    images: { type: [imageSchema], default: [] },
    videos: [{ url: String, publicId: String, thumbnail: String }],
    floorPlan: { url: String, publicId: String },
    brochure: { url: String, publicId: String },
  },
  { _id: false }
);

const featuredSchema = new Schema(
  {
    isFeatured: { type: Boolean, default: false },
    featuredUntil: Date,
    plan: String,
  },
  { _id: false }
);

const metricsSchema = new Schema(
  {
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    phoneReveals: { type: Number, default: 0 },
  },
  { _id: false }
);

const rentalDetailsSchema = new Schema(
  {
    monthly_rent: { type: Number, required: true },
    security_deposit: { type: Number, required: true },
    maintenance: Number,
    lock_in_period: String,
    available_from: { type: Date, required: true },
    pet_friendly: { type: Boolean, default: false },
    preferred_tenants: { type: [String], default: [] },
  },
  { _id: false }
);

const pgDetailsSchema = new Schema(
  {
    monthly_rent: { type: Number, required: true },
    security_deposit: { type: Number, required: true },
    sharing_type: { type: [String], required: true },
    meals_included: { type: Boolean, default: false },
    gender_preference: { type: String, enum: ["Male", "Female", "Any"], required: true },
    rules: [String],
  },
  { _id: false }
);


const propertySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    listedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listingType: { type: String, enum: ["owner", "agent", "builder"], required: true },
    purpose: { type: String, enum: ["sell", "rent", "lease", "pg"], required: true },
    category: { type: String, enum: ["residential", "commercial"], required: true },
    propertyType: {
      type: String,
      enum: ["flat", "villa", "plot", "house", "penthouse", "office", "shop", "warehouse", "showroom", "pg"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { 
      type: priceSchema, 
      required: function(this: any) { return this.purpose === 'sell'; } 
    },
    specs: { type: specsSchema, default: () => ({}) },
    amenities: { type: [String], default: [] },
    location: { type: locationSchema, required: true },
    media: { type: mediaSchema, default: () => ({}) },
    rental_details: { type: rentalDetailsSchema, default: undefined },
    pg_details: { type: pgDetailsSchema, default: undefined },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    status: {
      type: String,
      enum: ["draft", "pending_review", "active", "sold", "rented", "expired", "rejected", "archived"],
      default: "draft",
    },
    featured: { type: featuredSchema, default: () => ({}) },
    moderationNotes: String,
    rejectionReason: String,
    metrics: { type: metricsSchema, default: () => ({}) },
    fingerprint: String,
    deletedAt: Date,
    publishedAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

propertySchema.index({ "location.coordinates": "2dsphere" });
propertySchema.index({ status: 1, purpose: 1, "location.city": 1 });
propertySchema.index({ listedBy: 1, status: 1 });
propertySchema.index({ "price.amount": 1 });
propertySchema.index({ category: 1, propertyType: 1 });
propertySchema.index({ "location.city": 1, "location.locality": 1 });

export interface IProperty {
  _id: mongoose.Types.ObjectId;
  slug: string;
  listedBy: mongoose.Types.ObjectId;
  listingType: "owner" | "agent" | "builder";
  purpose: "sell" | "rent" | "lease" | "pg";
  category: "residential" | "commercial";
  propertyType: string;
  title: string;
  description: string;
  price?: {
    amount: number;
    currency: string;
    pricePerSqft?: number;
    negotiable: boolean;
    maintenance?: number;
    deposit?: number;
  };
  specs: Record<string, unknown>;
  amenities: string[];
  location: {
    address: { line1: string; line2?: string; landmark?: string };
    locality: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: { type: "Point"; coordinates: [number, number] };
  };
  media: {
    images: Array<{ url: string; publicId: string; caption?: string; isPrimary: boolean; order: number }>;
    videos?: Array<{ url: string; publicId: string; thumbnail: string }>;
    floorPlan?: { url: string; publicId: string };
    brochure?: { url: string; publicId: string };
  };

  rental_details?: {
    monthly_rent: number;
    security_deposit: number;
    maintenance?: number;
    lock_in_period?: string;
    available_from: Date;
    pet_friendly: boolean;
    preferred_tenants: string[];
  };

  pg_details?: {
    monthly_rent: number;
    security_deposit: number;
    sharing_type: string[];
    meals_included: boolean;
    gender_preference: "Male" | "Female" | "Any";
    rules?: string[];
  };

  status: string;
  featured: { isFeatured: boolean; featuredUntil?: Date; plan?: string };
  metrics: Record<string, number>;
  fingerprint?: string;
  deletedAt?: Date;
  publishedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default models.Property ?? model<IProperty>("Property", propertySchema);
