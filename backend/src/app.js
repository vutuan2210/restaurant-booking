import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.route.js";
import restaurantRoutes from "./routes/restaurant.route.js";
import menuRoutes from "./routes/menu.route.js";
import reservationRoutes from "./routes/reservation.route.js";
import reservationUpdateRoutes from "./routes/reservation-update.route.js";
import tableRoutes from "./routes/table.route.js";
import invoiceRoutes from "./routes/invoice.route.js";
import invoiceAutoRoutes from "./routes/invoice-auto.route.js";
import "./jobs/reservationTimestamps.job.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/reservations", reservationUpdateRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/invoices", invoiceAutoRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Backend + MongoDB working 🚀" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

