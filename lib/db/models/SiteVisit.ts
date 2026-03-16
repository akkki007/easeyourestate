import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteVisit extends Document {
    propertyId: mongoose.Types.ObjectId;
    buyerId: mongoose.Types.ObjectId;
    preferredDate: string; // YYYY-MM-DD
    preferredTime: string; // HH:MM
    notes?: string;
    status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
    createdAt: Date;
    updatedAt: Date;
}

const SiteVisitSchema = new Schema<ISiteVisit>(
    {
        propertyId: {
            type: Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },
        buyerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        preferredDate: {
            type: String,
            required: true,
        },
        preferredTime: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled", "rescheduled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const SiteVisit: Model<ISiteVisit> =
    mongoose.models.SiteVisit || mongoose.model<ISiteVisit>("SiteVisit", SiteVisitSchema);

export default SiteVisit;
