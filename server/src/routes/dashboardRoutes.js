import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { adminSummary } from "../controllers/dashboardController.js";

const router = Router();

router.get("/admin-summary", requireAuth, requireRole("admin"), adminSummary);

export default router;
