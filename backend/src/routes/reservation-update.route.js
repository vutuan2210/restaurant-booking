import { updateMenuItems } from "../controllers/reservation-update.controller.js";
import express from "express";

const router = express.Router();

router.put("/:id/menu", updateMenuItems);

export default router;
