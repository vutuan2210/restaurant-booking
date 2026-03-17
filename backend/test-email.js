import dotenv from "dotenv";
dotenv.config();

import { sendReservationReminderEmail } from "./src/services/email.service.js";

const testEmail = process.argv[2] || "test@example.com";
const checkinTime = "21:00, Thứ Bảy 15/03/2026";

console.log(`Sending reminder email to ${testEmail}...`);
sendReservationReminderEmail(testEmail, "Nguyễn Văn A", checkinTime).then((success) => {
  if (success) {
    console.log("✅ Email sent successfully!");
  } else {
    console.log("❌ Email failed — check EMAIL_USER and EMAIL_PASS in .env");
  }
});
