import { ClientProfile } from "../models/ClientProfile.js";
import { User } from "../models/User.js";
import { Site } from "../models/Site.js";
import { GuardProfile } from "../models/GuardProfile.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";

const PLAN_LIMITS = { basic: 5, standard: 15, premium: 50 };

// Admin: list all clients
export const listClients = asyncHandler(async (req, res) => {
  const clients = await ClientProfile.find()
    .populate("user", "-passwordHash")
    .sort({ createdAt: -1 });
  res.json(clients);
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await ClientProfile.findById(req.params.id).populate("user", "-passwordHash");
  if (!client) throw new ApiError(404, "Client not found");

  const sites = await Site.find({ client: client._id });
  res.json({ ...client.toObject(), sites });
});

// Admin: change a client's subscription plan
export const updateClientPlan = asyncHandler(async (req, res) => {
  const { subscriptionPlan, subscriptionStatus } = req.body;
  const client = await ClientProfile.findById(req.params.id);
  if (!client) throw new ApiError(404, "Client not found");

  if (subscriptionPlan) {
    if (!PLAN_LIMITS[subscriptionPlan]) throw new ApiError(400, "Invalid subscriptionPlan");
    client.subscriptionPlan = subscriptionPlan;
    client.maxGuards = PLAN_LIMITS[subscriptionPlan];
  }
  if (subscriptionStatus) client.subscriptionStatus = subscriptionStatus;

  await client.save();
  res.json(client);
});

export const deactivateClient = asyncHandler(async (req, res) => {
  const client = await ClientProfile.findById(req.params.id);
  if (!client) throw new ApiError(404, "Client not found");

  client.subscriptionStatus = "cancelled";
  await client.save();
  await User.findByIdAndUpdate(client.user, { isActive: false });

  res.json({ message: "Client deactivated" });
});

// Client: get own profile + sites + assigned guards
export const getMyClientProfile = asyncHandler(async (req, res) => {
  const client = await ClientProfile.findOne({ user: req.user._id });
  if (!client) throw new ApiError(404, "Client profile not found");

  const sites = await Site.find({ client: client._id });
  const siteIds = sites.map((s) => s._id);
  const guards = await GuardProfile.find({ assignedSite: { $in: siteIds } }).populate(
    "user",
    "-passwordHash"
  );

  res.json({ ...client.toObject(), sites, guards });
});
