import { createReservation, getReservations, getReservationById, checkinReservation, checkoutReservation, cancelReservation } from "../controllers/reservation.controller.js";
import express from "express";
import { authenticate, canView, canModify, authorize, filterByRestaurant } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET routes - STAFF or ADMIN only, filtered by restaurant
router.get("/", authenticate, canView, filterByRestaurant, getReservations);
router.get("/:id", authenticate, canView, getReservationById);

// POST - CLIENT or STAFF/ADMIN can create
router.post("/", authenticate, createReservation);
router.put("/:id/checkin", authenticate, authorize("ADMIN", "STAFF"), checkinReservation);
router.put("/:id/checkout", authenticate, authorize("ADMIN", "STAFF"), checkoutReservation);
router.put("/:id/cancel", authenticate, authorize("ADMIN", "STAFF"), cancelReservation);

export default router;