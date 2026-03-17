import cron from "node-cron";
import Reservation from "../models/reservation.model.js";
import Table from "../models/table.model.js";
import { sendReservationReminderEmail } from "../services/email.service.js";

// Reservation timestamps job with Vietnam timezone (UTC+7)
// Runs every minute to update timestamps and handle reservation lifecycle
cron.schedule("*/1 * * * *", async () => {
  try {
    const now = new Date(); // UTC — dùng trực tiếp cho DB query
    const displayTime = () => now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // 1. Auto-cancel expired reservations (15 minutes past expected time)
    const expiredReservations = await Reservation.find({
      status: "PENDING",
      expectedCheckinTime: {
        $lt: new Date(now.getTime() - 15 * 60 * 1000)
      }
    });

    for (const reservation of expiredReservations) {
      reservation.status = "CANCELLED";
      reservation.cancelledAt = now;
      await reservation.save();

      await Table.updateMany(
        { _id: { $in: reservation.tables } },
        { status: "AVAILABLE" }
      );

      console.log(`[${displayTime()}] Auto cancelled: ${reservation._id} (${reservation.customerName})`);
    }

    // 2. Check for reservations that should be reminded (30 minutes before checkin time)
    const reminderReservations = await Reservation.find({
      status: "PENDING",
      expectedCheckinTime: {
        $gte: new Date(now.getTime() + 25 * 60 * 1000),
        $lte: new Date(now.getTime() + 35 * 60 * 1000)
      },
      remindedAt: { $exists: false }
    });

    for (const reservation of reminderReservations) {
      reservation.remindedAt = now;
      await reservation.save();

      const checkinTimeStr = reservation.expectedCheckinTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

      if (reservation.customerEmail) {
        await sendReservationReminderEmail(reservation.customerEmail, reservation.customerName, checkinTimeStr);
      }

      console.log(`[${displayTime()}] Reminder sent: ${reservation._id} (${reservation.customerName}) - Checkin at: ${checkinTimeStr}`);
    }

  } catch (error) {
    console.error("Reservation timestamps error:", error.message);
  }
}, {
  timezone: "Asia/Ho_Chi_Minh"
});
