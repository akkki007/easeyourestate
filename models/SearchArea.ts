import mongoose, { Schema, models, model } from "mongoose";

const SearchAreaSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },

  searchArea: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    radius: {
      type: Number,
      required: true,
    },
  },

  preferences: {
    type: Object,
    default: {},
  },

  areaName: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default models.SearchArea ||
  model("SearchArea", SearchAreaSchema);
