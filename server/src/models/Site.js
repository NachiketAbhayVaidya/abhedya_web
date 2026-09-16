import mongoose from "mongoose";

const siteSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "ClientProfile", required: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    geofenceRadiusMeters: { type: Number, default: 200 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Site = mongoose.model("Site", siteSchema);
