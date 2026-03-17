import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPriceTrend extends Document {
    localitySlug: string;
    month: Date;
    avgPricePerSqft: number;
}

const PriceTrendSchema = new Schema<IPriceTrend>(
    {
        localitySlug: {
            type: String,
            required: true,
            index: true,
        },
        month: {
            type: Date,
            required: true,
        },
        avgPricePerSqft: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

// Compound index to ensure uniqueness of trend data per locality per month
PriceTrendSchema.index({ localitySlug: 1, month: 1 }, { unique: true });

const PriceTrend: Model<IPriceTrend> =
    mongoose.models.PriceTrend || mongoose.model<IPriceTrend>("PriceTrend", PriceTrendSchema);

export default PriceTrend;
