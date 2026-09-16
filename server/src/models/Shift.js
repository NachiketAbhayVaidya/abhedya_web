import mongoose from "mongoose";

const punchSchema = new mongoose.Schema(
  {
    time: { type: Date, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    distanceFromSiteMeters: { type: Number, required: true },
  },
  { _id: false }
);

const shiftSchema = new mongoose.Schema(
  {
    guard: { type: mongoose.Schema.Types.ObjectId, ref: "GuardProfile", required: true },
    site: { type: mongoose.Schema.Types.ObjectId, ref: "Site", required: true },
    clockIn: { type: punchSchema, required: true },
    clockOut: { type: punchSchema, default: null },
    hoursWorked: { type: Number, default: 0 },
    hourlyRateAtShift: { type: Number, required: true },
    status: { type: String, enum: ["open", "completed"], default: "open" },
  },
  { timestamps: true }
);

shiftSchema.index({ guard: 1, status: 1 });

export const Shift = mongoose.model("Shift", shiftSchema);
