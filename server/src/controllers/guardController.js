import { GuardProfile } from "../models/GuardProfile.js";
import { User } from "../models/User.js";
import { Site } from "../models/Site.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";

// Admin: list all guards with user + site info
export const listGuards = asyncHandler(async (req, res) => {
  const guards = await GuardProfile.find()
    .populate("user", "-passwordHash")
    .populate("assignedSite")
    .sort({ createdAt: -1 });
  res.json(guards);
});

export const getGuard = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findById(req.params.id)
    .populate("user", "-passwordHash")
    .populate("assignedSite");
  if (!guard) throw new ApiError(404, "Guard not found");
  res.json(guard);
});

export const updateGuard = asyncHandler(async (req, res) => {
  const { hourlyRate, status, assignedSite } = req.body;
  const guard = await GuardProfile.findById(req.params.id);
  if (!guard) throw new ApiError(404, "Guard not found");

  if (assignedSite) {
    const site = await Site.findById(assignedSite);
    if (!site) throw new ApiError(400, "assignedSite is not a valid site");
  }

  if (hourlyRate !== undefined) guard.hourlyRate = hourlyRate;
  if (status !== undefined) guard.status = status;
  if (assignedSite !== undefined) guard.assignedSite = assignedSite || null;

  await guard.save();
  res.json(guard);
});

export const deactivateGuard = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findById(req.params.id);
  if (!guard) throw new ApiError(404, "Guard not found");

  guard.status = "inactive";
  await guard.save();
  await User.findByIdAndUpdate(guard.user, { isActive: false });

  res.json({ message: "Guard deactivated" });
});

export const addGuardDocument = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findById(req.params.id);
  if (!guard) throw new ApiError(404, "Guard not found");
  if (!req.file) throw new ApiError(400, "A document file is required");

  guard.documents.push({
    name: req.body.name || req.file.originalname,
    url: `/uploads/documents/${req.file.filename}`,
  });
  await guard.save();
  res.status(201).json(guard);
});

// Guard: get own profile
export const getMyGuardProfile = asyncHandler(async (req, res) => {
  const guard = await GuardProfile.findOne({ user: req.user._id }).populate("assignedSite");
  if (!guard) throw new ApiError(404, "Guard profile not found");
  res.json(guard);
});
