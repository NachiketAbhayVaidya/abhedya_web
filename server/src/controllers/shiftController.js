import { Shift } from "../models/Shift.js";
import { GuardProfile } from "../models/GuardProfile.js";
import { Site } from "../models/Site.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { distanceInMeters } from "../utils/geo.js";

async function getGuardProfileOrThrow(userId) {
  const guard = await GuardProfile.findOne({ user: userId });
  if (!guard) throw new ApiError(404, "Guard profile not found");
  return guard;
}

export const clockIn = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    throw new ApiError(400, "lat and lng (numbers) are required");
  }

  const guard = await getGuardProfileOrThrow(req.user._id);
  if (!guard.assignedSite) throw new ApiError(400, "You are not assigned to a site yet");

  const existingOpenShift = await Shift.findOne({ guard: guard._id, status: "open" });
  if (existingOpenShift) throw new ApiError(409, "You already have an open shift");

  const site = await Site.findById(guard.assignedSite);
  if (!site || !site.isActive) throw new ApiError(400, "Assigned site is not active");

  const distance = distanceInMeters(site.location, { lat, lng });
  if (distance > site.geofenceRadiusMeters) {
    throw new ApiError(
      403,
      `You are ${Math.round(distance)}m from the site, outside the ${site.geofenceRadiusMeters}m allowed radius`
    );
  }

  const shift = await Shift.create({
    guard: guard._id,
    site: site._id,
    hourlyRateAtShift: guard.hourlyRate,
    clockIn: { time: new Date(), location: { lat, lng }, distanceFromSiteMeters: distance },
  });

  res.status(201).json(shift);
});

export const clockOut = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    throw new ApiError(400, "lat and lng (numbers) are required");
  }

  const guard = await getGuardProfileOrThrow(req.user._id);
  const shift = await Shift.findOne({ guard: guard._id, status: "open" });
  if (!shift) throw new ApiError(400, "You do not have an open shift to clock out of");

  const site = await Site.findById(shift.site);
  const distance = distanceInMeters(site.location, { lat, lng });

  const clockOutTime = new Date();
  const hoursWorked =
    (clockOutTime.getTime() - shift.clockIn.time.getTime()) / (1000 * 60 * 60);

  shift.clockOut = { time: clockOutTime, location: { lat, lng }, distanceFromSiteMeters: distance };
  shift.hoursWorked = Math.round(hoursWorked * 100) / 100;
  shift.status = "completed";
  await shift.save();

  res.json(shift);
});

export const getMyCurrentShift = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrThrow(req.user._id);
  const shift = await Shift.findOne({ guard: guard._id, status: "open" }).populate("site");
  res.json(shift);
});

export const listMyShifts = asyncHandler(async (req, res) => {
  const guard = await getGuardProfileOrThrow(req.user._id);
  const shifts = await Shift.find({ guard: guard._id }).populate("site").sort({ createdAt: -1 });
  res.json(shifts);
});

// Admin: list shifts, optionally filtered by guard/site
export const listShifts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.guard) filter.guard = req.query.guard;
  if (req.query.site) filter.site = req.query.site;
  if (req.query.status) filter.status = req.query.status;

  const shifts = await Shift.find(filter)
    .populate({ path: "guard", populate: { path: "user", select: "-passwordHash" } })
    .populate("site")
    .sort({ createdAt: -1 })
    .limit(500);
  res.json(shifts);
});

// Client: list shifts for their own sites
export const listShiftsForClientSites = asyncHandler(async (req, res) => {
  const { siteIds } = req; // attached by middleware in routes
  const shifts = await Shift.find({ site: { $in: siteIds } })
    .populate({ path: "guard", populate: { path: "user", select: "-passwordHash" } })
    .populate("site")
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(shifts);
});
