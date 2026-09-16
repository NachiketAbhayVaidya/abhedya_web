import { Site } from "../models/Site.js";
import { ClientProfile } from "../models/ClientProfile.js";
import { GuardProfile } from "../models/GuardProfile.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";

// Admin: create a site for a client
export const createSite = asyncHandler(async (req, res) => {
  const { client, name, address, location, geofenceRadiusMeters } = req.body;

  if (!client || !name || !address || !location?.lat || !location?.lng) {
    throw new ApiError(400, "client, name, address and location {lat,lng} are required");
  }

  const clientProfile = await ClientProfile.findById(client);
  if (!clientProfile) throw new ApiError(400, "client is not a valid client profile id");

  const site = await Site.create({
    client,
    name,
    address,
    location,
    geofenceRadiusMeters: geofenceRadiusMeters || 200,
  });
  res.status(201).json(site);
});

// Admin: list all sites, optionally filtered by client
export const listSites = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.client) filter.client = req.query.client;
  const sites = await Site.find(filter).populate({
    path: "client",
    populate: { path: "user", select: "-passwordHash" },
  });
  res.json(sites);
});

export const getSite = asyncHandler(async (req, res) => {
  const site = await Site.findById(req.params.id).populate({
    path: "client",
    populate: { path: "user", select: "-passwordHash" },
  });
  if (!site) throw new ApiError(404, "Site not found");

  const guards = await GuardProfile.find({ assignedSite: site._id }).populate(
    "user",
    "-passwordHash"
  );
  res.json({ ...site.toObject(), guards });
});

export const updateSite = asyncHandler(async (req, res) => {
  const { name, address, location, geofenceRadiusMeters, isActive } = req.body;
  const site = await Site.findById(req.params.id);
  if (!site) throw new ApiError(404, "Site not found");

  if (name !== undefined) site.name = name;
  if (address !== undefined) site.address = address;
  if (location !== undefined) site.location = location;
  if (geofenceRadiusMeters !== undefined) site.geofenceRadiusMeters = geofenceRadiusMeters;
  if (isActive !== undefined) site.isActive = isActive;

  await site.save();
  res.json(site);
});

export const deleteSite = asyncHandler(async (req, res) => {
  const site = await Site.findById(req.params.id);
  if (!site) throw new ApiError(404, "Site not found");

  const assignedGuards = await GuardProfile.countDocuments({ assignedSite: site._id });
  if (assignedGuards > 0) {
    throw new ApiError(400, "Unassign guards from this site before deleting it");
  }

  await site.deleteOne();
  res.json({ message: "Site deleted" });
});
