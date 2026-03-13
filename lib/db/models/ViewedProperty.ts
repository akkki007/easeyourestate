import mongoose, { Schema, model, models } from "mongoose";

export interface IViewedProperty {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  viewedAt: Date;
}

const viewedPropertySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
  viewedAt: { type: Date, default: Date.now },
});

viewedPropertySchema.index({ userId: 1, viewedAt: -1 });
viewedPropertySchema.index({ userId: 1, propertyId: 1 }, { unique: true });

export default models.ViewedProperty ?? model<IViewedProperty>("ViewedProperty", viewedPropertySchema);
