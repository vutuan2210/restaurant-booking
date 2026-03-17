import express from "express";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller.js";
import { authenticate, canView, canModify, filterByRestaurant } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET routes - STAFF or ADMIN only, filtered by restaurant
router.get("/", authenticate, canView, filterByRestaurant, getEmployees);
router.get("/:id", authenticate, canView, getEmployee);

// POST/PUT/DELETE - ADMIN only
router.post("/", authenticate, canModify, createEmployee);
router.put("/:id", authenticate, canModify, updateEmployee);
router.delete("/:id", authenticate, canModify, deleteEmployee);

export default router;
