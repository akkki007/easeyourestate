import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IContactRequest extends Document {
  buyerId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  propertyTitle: string;
  propertySlug: string;
  propertyLocality: string;
  propertyCity: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const contactRequestSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    buyerName: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    buyerEmail: String,
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    ownerEmail: String,
    propertyTitle: { type: String, required: true },
    propertySlug: { type: String, required: true },
    propertyLocality: { type: String, required: true },
    propertyCity: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: String,
    approvedAt: Date,
    rejectedAt: Date,
  },
  { timestamps: true }
);

contactRequestSchema.index({ status: 1, createdAt: -1 });
contactRequestSchema.index({ buyerId: 1 });
contactRequestSchema.index({ propertyId: 1, buyerId: 1 }, { unique: true });

export default models.ContactRequest ??
  model<IContactRequest>("ContactRequest", contactRequestSchema);
