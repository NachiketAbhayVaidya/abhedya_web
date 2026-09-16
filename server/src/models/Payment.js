import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    guard: { type: mongoose.Schema.Types.ObjectId, ref: "GuardProfile", required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    shifts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shift" }],
    hoursWorked: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paidAt: { type: Date, default: null },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
