import { GuardProfile } from "../models/GuardProfile.js";
import { ClientProfile } from "../models/ClientProfile.js";
import { Shift } from "../models/Shift.js";
import { Payment } from "../models/Payment.js";
import { Complaint } from "../models/Complaint.js";
import { asyncHandler } from "../utils/ApiError.js";

export const adminSummary = asyncHandler(async (req, res) => {
  const [totalGuards, activeGuards, totalClients, openShifts, pendingPayments, openComplaints] =
    await Promise.all([
      GuardProfile.countDocuments(),
      GuardProfile.countDocuments({ status: "active" }),
      ClientProfile.countDocuments(),
      Shift.countDocuments({ status: "open" }),
      Payment.countDocuments({ status: "pending" }),
      Complaint.countDocuments({ status: { $ne: "resolved" } }),
    ]);

  res.json({ totalGuards, activeGuards, totalClients, openShifts, pendingPayments, openComplaints });
});
