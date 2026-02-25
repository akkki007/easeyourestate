import mongoose, { Schema, Document, Model } from "mongoose";

interface IAdminAction {
  adminId: mongoose.Types.ObjectId;
  action: string;
  actionAt: Date;
}

export interface IReport extends Document {
  reportedBy: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  adminActions: IAdminAction[];
  createdAt: Date;
}

const AdminActionSchema = new Schema<IAdminAction>({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  action: {
    type: String,
    required: true,
  },

  actionAt: {
    type: Date,
    default: Date.now,
  },
});

const ReportSchema = new Schema<IReport>(
  {
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
    },

    adminActions: [AdminActionSchema],
  },
  { timestamps: true }
);

const Report: Model<IReport> =
  mongoose.models.Report ||
  mongoose.model<IReport>("Report", ReportSchema);

export default Report;