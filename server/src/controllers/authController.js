import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { GuardProfile } from "../models/GuardProfile.js";
import { ClientProfile } from "../models/ClientProfile.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { signToken, cookieOptions, AUTH_COOKIE_NAME } from "../utils/token.js";

// Public self-registration is limited to "guard" and "client" roles.
// Admin accounts are provisioned via the seed script, never through this endpoint.
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, organizationName, hourlyRate } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "name, email, password and role are required");
  }
  if (!["guard", "client"].includes(role)) {
    throw new ApiError(400, "role must be either 'guard' or 'client'");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }
  if (role === "client" && !organizationName) {
    throw new ApiError(400, "organizationName is required for client accounts");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "email already in use");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, role, passwordHash });

  if (role === "guard") {
    await GuardProfile.create({ user: user._id, hourlyRate: hourlyRate || 150 });
  } else {
    await ClientProfile.create({ user: user._id, organizationName });
  }

  const token = signToken(user);
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
  res.status(201).json({ user: user.toSafeObject(), token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) throw new ApiError(401, "Invalid credentials");

  const valid = await user.comparePassword(password);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const token = signToken(user);
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
  res.json({ user: user.toSafeObject(), token });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions());
  res.json({ message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  let profile = null;
  if (req.user.role === "guard") {
    profile = await GuardProfile.findOne({ user: req.user._id }).populate("assignedSite");
  } else if (req.user.role === "client") {
    profile = await ClientProfile.findOne({ user: req.user._id });
  }
  res.json({ user: req.user.toSafeObject(), profile });
});
