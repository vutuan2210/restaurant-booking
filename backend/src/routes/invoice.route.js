import express from "express";
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoicePaid,
} from "../controllers/invoice.controller.js";
import { authenticate, canView, canModify, authorize, filterByRestaurant } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET routes - STAFF or ADMIN only, filtered by restaurant
router.get("/", authenticate, canView, filterByRestaurant, getInvoices);
router.get("/:id", authenticate, canView, getInvoice);

// POST/PUT/DELETE - ADMIN only
router.post("/", authenticate, canModify, createInvoice);
router.put("/:id", authenticate, canModify, updateInvoice);
router.put("/:id/pay", authenticate, authorize("ADMIN", "STAFF"), markInvoicePaid);
router.delete("/:id", authenticate, canModify, deleteInvoice);

export default router;
