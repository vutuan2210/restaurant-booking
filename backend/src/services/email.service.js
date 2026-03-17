import nodemailer from "nodemailer";

/**
 * Send an email via Gmail SMTP.
 * Env vars needed:
 *   EMAIL_USER - Gmail address (e.g. yourapp@gmail.com)
 *   EMAIL_PASS - Gmail App Password (NOT regular password)
 *               Generate at: https://myaccount.google.com/apppasswords
 */
const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Send an email.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<boolean>}
 */
export const sendEmail = async (to, subject, html) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("[Email] Email credentials not configured. Skipping email.");
    return false;
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"Nhà hàng" <${user}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to} — messageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}: ${error.message}`);
    return false;
  }
};

/**
 * Send reservation reminder email.
 * @param {string} to - Customer email
 * @param {string} customerName
 * @param {string} checkinTime - Formatted time string
 */
export const sendReservationReminderEmail = async (to, customerName, checkinTime) => {
  const subject = "Nhắc nhở: Đặt bàn sắp tới hẹn";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #d32f2f;">🍽️ Nhắc nhở đặt bàn</h2>
      <p>Xin chào <strong>${customerName}</strong>,</p>
      <p>Bạn có lịch đặt bàn vào lúc:</p>
      <p style="font-size: 20px; font-weight: bold; color: #1976d2; text-align: center; padding: 10px; background: #e3f2fd; border-radius: 4px;">
        ${checkinTime}
      </p>
      <p>Vui lòng đến đúng giờ. Chúng tôi sẽ giữ bàn trong vòng <strong>15 phút</strong> kể từ giờ hẹn.</p>
      <p>Cảm ơn bạn đã tin tưởng và lựa chọn nhà hàng của chúng tôi!</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #757575;">Đây là email tự động, vui lòng không trả lời.</p>
    </div>
  `;
  return sendEmail(to, subject, html);
};
