import mongoose from "mongoose";

const guardProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    hourlyRate: { type: Number, required: true, default: 150 },
    assignedSite: { type: mongoose.Schema.Types.ObjectId, ref: "Site", default: null },
    status: { type: String, enum: ["active", "inactive", "on_leave"], default: "active" },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const GuardProfile = mongoose.model("GuardProfile", guardProfileSchema);
