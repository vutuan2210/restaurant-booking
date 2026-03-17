import { generateInvoice, updatePayment } from "../controllers/invoice-auto.controller.js";
import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// ADMIN or STAFF can generate invoices and update payment
router.post("/generate/:reservationId", authenticate, authorize("ADMIN", "STAFF"), generateInvoice);
router.put("/:id/payment", authenticate, authorize("ADMIN", "STAFF"), updatePayment);

export default router;
