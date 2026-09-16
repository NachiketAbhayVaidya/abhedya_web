import mongoose from "mongoose";

const clientProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    organizationName: { type: String, required: true, trim: true },
    billingAddress: { type: String, trim: true },
    subscriptionPlan: {
      type: String,
      enum: ["basic", "standard", "premium"],
      default: "basic",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    maxGuards: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export const ClientProfile = mongoose.model("ClientProfile", clientProfileSchema);
