import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

let transporter = null;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: false,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Email stub] To: ${to}, Subject: ${subject}`);
    return;
  }
  await transport.sendMail({
    from: `"Expense Manager" <${env.smtp.user}>`,
    to,
    subject,
    html,
  });
}

export function getMonthYear(date = new Date()) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return { month: months[date.getMonth()], year: date.getFullYear() };
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function logActivity(userId, action, entity, entityId, details = {}, ip = '') {
  const AuditLog = (await import('../models/AuditLog.js')).default;
  await AuditLog.create({ userId, action, entity, entityId, details, ipAddress: ip });
}
