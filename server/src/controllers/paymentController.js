import { Payment } from "../models/Payment.js";
import { Shift } from "../models/Shift.js";
import { GuardProfile } from "../models/GuardProfile.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";

// Admin: generate a payment for a guard by summing unpaid completed shifts in a date range
export const generatePayment = asyncHandler(async (req, res) => {
  const { guard: guardId, periodStart, periodEnd } = req.body;
  if (!guardId || !periodStart || !periodEnd) {
    throw new ApiError(400, "guard, periodStart and periodEnd are required");
  }

  const guard = await GuardProfile.findById(guardId);
  if (!guard) throw new ApiError(404, "Guard not found");

  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  const alreadyPaidShiftIds = (
    await Payment.find({ guard: guardId }).distinct("shifts")
  ).map(String);

  const shifts = await Shift.find({
    guard: guardId,
    status: "completed",
    "clockOut.time": { $gte: start, $lte: end },
    _id: { $nin: alreadyPaidShiftIds },
  });

  if (shifts.length === 0) {
    throw new ApiError(400, "No unpaid completed shifts found in this period");
  }

  const hoursWorked = shifts.reduce((sum, s) => sum + s.hoursWorked, 0);
  const amount = shifts.reduce((sum, s) => sum + s.hoursWorked * s.hourlyRateAtShift, 0);

  const payment = await Payment.create({
    guard: guardId,
    periodStart: start,
    periodEnd: end,
    shifts: shifts.map((s) => s._id),
    hoursWorked: Math.round(hoursWorked * 100) / 100,
    amount: Math.round(amount * 100) / 100,
  });

  res.status(201).json(payment);
});

export const markPaymentPaid = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) throw new ApiError(404, "Payment not found");
  if (payment.status === "paid") throw new ApiError(400, "Payment already marked paid");

  payment.status = "paid";
  payment.paidAt = new Date();
  if (req.body.notes) payment.notes = req.body.notes;
  await payment.save();

  res.json(payment);
});

// Admin: list all payments, optionally filtered by guard/status
export const listPayments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.guard) filter.guard = req.query.guard;
  if (req.query.status) filter.status = req.query.status;

  const payments = await Payment.find(filter)
    .populate({ path: "guard", populate: { path: "user", select: "-passwordHash" } })
    .sort({ createdAt: -1 });
  res.json(payments);
});

// Guard: list own payments
export const listMyPayments = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({ user: req.user._id });
  if (!guard) throw new ApiError(404, "Guard profile not found");

  const payments = await Payment.find({ guard: guard._id }).sort({ createdAt: -1 });
  res.json(payments);
});
