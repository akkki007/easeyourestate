import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISearchArea extends Document {
  tenantId: mongoose.Types.ObjectId;
  center: {
    lat: number;
    lng: number;
  };
  radiusKm: number;
  preferences: {
    budget?: number;
    bhk?: number;
    furnished?: string;
  };
  createdAt: Date;
}

const SearchAreaSchema = new Schema<ISearchArea>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    center: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },

    radiusKm: {
      type: Number,
      required: true,
    },

    preferences: {
      budget: Number,
      bhk: Number,
      furnished: String,
    },
  },
  { timestamps: true }
);

const SearchArea: Model<ISearchArea> =
  mongoose.models.SearchArea ||
  mongoose.model<ISearchArea>("SearchArea", SearchAreaSchema);

export default SearchArea;