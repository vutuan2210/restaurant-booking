import express from "express";
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurant.controller.js";
import { authenticate, canView, canModify } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET routes - STAFF or ADMIN only
router.get("/", authenticate, canView, getRestaurants);
router.get("/:id", authenticate, canView, getRestaurant);

// POST/PUT/DELETE - ADMIN only
router.post("/", authenticate, canModify, createRestaurant);
router.put("/:id", authenticate, canModify, updateRestaurant);
router.delete("/:id", authenticate, canModify, deleteRestaurant);

export default router;