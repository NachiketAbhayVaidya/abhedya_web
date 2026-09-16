import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listClients,
  getClient,
  updateClientPlan,
  deactivateClient,
  getMyClientProfile,
} from "../controllers/clientController.js";

const router = Router();

router.get("/me", requireAuth, requireRole("client"), getMyClientProfile);

router.get("/", requireAuth, requireRole("admin"), listClients);
router.get("/:id", requireAuth, requireRole("admin"), getClient);
router.patch("/:id/plan", requireAuth, requireRole("admin"), updateClientPlan);
router.post("/:id/deactivate", requireAuth, requireRole("admin"), deactivateClient);

export default router;
