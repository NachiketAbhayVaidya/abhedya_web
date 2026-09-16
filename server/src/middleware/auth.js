import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { verifyToken, AUTH_COOKIE_NAME } from "../utils/token.js";
import { User } from "../models/User.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[AUTH_COOKIE_NAME] || bearer;

  if (!token) throw new ApiError(401, "Not authenticated");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired session");
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, "Account not found or disabled");

  req.user = user;
  next();
});

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }
    next();
  };
