import express from "express";
import {
  getMenu,
  getMenuItem,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menu.controller.js";
import { authenticate, canView, canModify, filterByRestaurant } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET routes - STAFF or ADMIN only, filtered by restaurant
router.get("/", authenticate, canView, filterByRestaurant, getMenu);
router.get("/:itemId", authenticate, canView, getMenuItem);

// POST/PUT/DELETE - ADMIN only
router.post("/", authenticate, canModify, addMenuItem);
router.put("/:itemId", authenticate, canModify, updateMenuItem);
router.delete("/:itemId", authenticate, canModify, deleteMenuItem);

export default router;
