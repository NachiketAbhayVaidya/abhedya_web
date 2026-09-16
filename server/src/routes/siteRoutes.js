import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createSite,
  listSites,
  getSite,
  updateSite,
  deleteSite,
} from "../controllers/siteController.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.post("/", createSite);
router.get("/", listSites);
router.get("/:id", getSite);
router.patch("/:id", updateSite);
router.delete("/:id", deleteSite);

export default router;
