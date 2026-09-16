import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  generatePayment,
  markPaymentPaid,
  listPayments,
  listMyPayments,
} from "../controllers/paymentController.js";

const router = Router();

router.get("/mine", requireAuth, requireRole("guard"), listMyPayments);

router.post("/", requireAuth, requireRole("admin"), generatePayment);
router.get("/", requireAuth, requireRole("admin"), listPayments);
router.post("/:id/mark-paid", requireAuth, requireRole("admin"), markPaymentPaid);

export default router;
