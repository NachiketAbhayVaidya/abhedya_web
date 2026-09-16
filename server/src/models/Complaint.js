import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "ClientProfile", required: true },
    site: { type: mongoose.Schema.Types.ObjectId, ref: "Site", default: null },
    guard: { type: mongoose.Schema.Types.ObjectId, ref: "GuardProfile", default: null },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    resolutionNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Complaint = mongoose.model("Complaint", complaintSchema);
