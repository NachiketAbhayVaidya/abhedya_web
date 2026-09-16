import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { ClientProfile } from "../models/ClientProfile.js";
import { Site } from "../models/Site.js";
import {
  clockIn,
  clockOut,
  getMyCurrentShift,
  listMyShifts,
  listShifts,
  listShiftsForClientSites,
} from "../controllers/shiftController.js";

const router = Router();

const attachClientSiteIds = asyncHandler(async (req, res, next) => {
  const clientProfile = await ClientProfile.findOne({ user: req.user._id });
  if (!clientProfile) throw new ApiError(404, "Client profile not found");
  const sites = await Site.find({ client: clientProfile._id }, "_id");
  req.siteIds = sites.map((s) => s._id);
  next();
});

router.post("/clock-in", requireAuth, requireRole("guard"), clockIn);
router.post("/clock-out", requireAuth, requireRole("guard"), clockOut);
router.get("/mine/current", requireAuth, requireRole("guard"), getMyCurrentShift);
router.get("/mine", requireAuth, requireRole("guard"), listMyShifts);

router.get("/client-sites", requireAuth, requireRole("client"), attachClientSiteIds, listShiftsForClientSites);

router.get("/", requireAuth, requireRole("admin"), listShifts);

export default router;
