import express from "express";
import {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  getAvailableTables,
} from "../controllers/table.controller.js";
import { authenticate, canView, canModify, filterByRestaurant } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET routes - STAFF or ADMIN only, filtered by restaurant
router.get("/", authenticate, canView, filterByRestaurant, getTables);
router.get("/available", authenticate, canView, filterByRestaurant, getAvailableTables);
router.get("/:id", authenticate, canView, getTable);

// POST/PUT/DELETE - ADMIN only
router.post("/", authenticate, canModify, createTable);
router.put("/:id", authenticate, canModify, updateTable);
router.delete("/:id", authenticate, canModify, deleteTable);

export default router;
