import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { uploadComplaintAttachment } from "../middleware/upload.js";
import {
  createComplaint,
  listMyComplaints,
  listComplaints,
  getComplaint,
  updateComplaintStatus,
} from "../controllers/complaintController.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("client"),
  uploadComplaintAttachment.array("attachments", 3),
  createComplaint
);
router.get("/mine", requireAuth, requireRole("client"), listMyComplaints);

router.get("/", requireAuth, requireRole("admin"), listComplaints);
router.get("/:id", requireAuth, requireRole("admin", "client"), getComplaint);
router.patch("/:id", requireAuth, requireRole("admin"), updateComplaintStatus);

export default router;
