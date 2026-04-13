import nodemailer from "nodemailer";
import { getSmtpConfig, isProductionEnvironment } from "./env.mjs";

let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter !== null) {
    return cachedTransporter;
  }

  const config = getSmtpConfig();

  if (!config) {
    cachedTransporter = null;
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return cachedTransporter;
}

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
  expiresInMinutes,
}) {
  const transporter = await getTransporter();

  if (!transporter) {
    console.info(`[rideflex] Password reset link for ${email}: ${resetUrl}`);
    return {
      delivered: false,
      previewUrl: isProductionEnvironment() ? undefined : resetUrl,
    };
  }

  const greetingName = name?.trim() || "there";
  const subject = "Reset your RideFlex password";
  const text = [
    `Hi ${greetingName},`,
    "",
    "We received a request to reset your RideFlex password.",
    `Use this secure link within ${expiresInMinutes} minutes:`,
    resetUrl,
    "",
    "If you did not request this reset, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; color: #111111; line-height: 1.6;">
      <p>Hi ${greetingName},</p>
      <p>We received a request to reset your RideFlex password.</p>
      <p>
        Use the secure link below within <strong>${expiresInMinutes} minutes</strong>:
      </p>
      <p>
        <a
          href="${resetUrl}"
          style="display: inline-block; border-radius: 12px; background: #d61032; color: #ffffff; padding: 12px 18px; text-decoration: none; font-weight: 600;"
        >
          Reset password
        </a>
      </p>
      <p style="word-break: break-all; color: #616161;">${resetUrl}</p>
      <p>If you did not request this reset, you can ignore this email.</p>
    </div>
  `;

  const config = getSmtpConfig();
  await transporter.sendMail({
    from: config.from,
    to: email,
    subject,
    text,
    html,
  });

  return {
    delivered: true,
  };
}
