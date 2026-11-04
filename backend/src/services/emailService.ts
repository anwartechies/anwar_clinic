import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env";
import {
  getStaffInviteEmailTemplate,
  StaffInviteTemplateData,
} from "./emailTemplates";

let cachedTransporter: Transporter | null = null;

/**
 * Returns a configured Nodemailer Transporter instance.
 */
export function getMailTransporter(): Transporter {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }
  return cachedTransporter;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Generic email sending function.
 */
export async function sendEmail({ to, subject, html, text }: SendMailOptions) {
  // Gracefully handle unconfigured credentials without failing API requests
  if (!env.smtp.pass) {
    console.warn(
      `[EmailService] SMTP_PASS is not configured in .env. Outbound email to "${to}" was skipped. (From: ${env.smtp.from})`
    );
    return { success: false, skipped: true, reason: "SMTP_PASS not configured" };
  }

  try {
    const transporter = getMailTransporter();
    const info = await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html,
      text,
    });

    console.log(`[EmailService] Email sent successfully to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
}

/**
 * Sends a staff invitation email with role details and login instructions.
 */
export async function sendStaffInviteEmail(data: StaffInviteTemplateData) {
  const { subject, html, text } = getStaffInviteEmailTemplate(data);
  return sendEmail({
    to: data.recipientEmail,
    subject,
    html,
    text,
  });
}
