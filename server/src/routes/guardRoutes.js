import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { uploadGuardDocument } from "../middleware/upload.js";
import {
  listGuards,
  getGuard,
  updateGuard,
  deactivateGuard,
  addGuardDocument,
  getMyGuardProfile,
} from "../controllers/guardController.js";

const router = Router();

router.get("/me", requireAuth, requireRole("guard"), getMyGuardProfile);

router.get("/", requireAuth, requireRole("admin"), listGuards);
router.get("/:id", requireAuth, requireRole("admin"), getGuard);
router.patch("/:id", requireAuth, requireRole("admin"), updateGuard);
router.post("/:id/deactivate", requireAuth, requireRole("admin"), deactivateGuard);
router.post(
  "/:id/documents",
  requireAuth,
  requireRole("admin"),
  uploadGuardDocument.single("document"),
  addGuardDocument
);

export default router;
