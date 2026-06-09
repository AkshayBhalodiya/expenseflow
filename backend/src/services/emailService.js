import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let smtpTransporter = null;
let etherealTransporter = null;
let etherealAccount = null;

function getSmtpTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return smtpTransporter;
}

async function getEtherealTransporter() {
  if (etherealTransporter) return etherealTransporter;
  etherealAccount = await nodemailer.createTestAccount();
  etherealTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: etherealAccount.user, pass: etherealAccount.pass },
  });
  return etherealTransporter;
}

async function getMailTransport() {
  const smtp = getSmtpTransporter();
  if (smtp) return { transport: smtp, mode: 'smtp' };
  if (process.env.NODE_ENV !== 'production') {
    const ethereal = await getEtherealTransporter();
    return { transport: ethereal, mode: 'ethereal' };
  }
  return { transport: null, mode: 'none' };
}

function passwordResetHtml(name, resetUrl) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr><td style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:28px 32px;">
          <h1 style="margin:0;color:#fff;font-size:22px;">ExpenseFlow</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;">Password Reset Request</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hi ${name || 'there'},</p>
          <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
            We received a request to reset your password. Click the button below to choose a new password.
            This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">
            Reset Password
          </a>
          <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
            If you didn't request this, you can safely ignore this email.<br/>
            Or copy this link: <a href="${resetUrl}" style="color:#3b82f6;">${resetUrl}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const { transport, mode } = await getMailTransport();

  if (!transport) {
    console.log('\n========== PASSWORD RESET (no SMTP) ==========');
    console.log(`To: ${to}`);
    console.log(`Reset link: ${resetUrl}`);
    console.log('===============================================\n');
    return { sent: false, mode: 'console', resetUrl };
  }

  const from =
    mode === 'smtp'
      ? `"ExpenseFlow" <${env.smtp.user}>`
      : `"ExpenseFlow Dev" <${etherealAccount?.user || 'dev@expenseflow.local'}>`;

  const info = await transport.sendMail({
    from,
    to,
    subject: 'Reset your ExpenseFlow password',
    html: passwordResetHtml(name, resetUrl),
    text: `Reset your password: ${resetUrl} (expires in 1 hour)`,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[Email] Preview reset email: ${previewUrl}`);
  }

  return { sent: true, mode, previewUrl, resetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined };
}

export async function verifyEmailTransport() {
  const { transport, mode } = await getMailTransport();
  if (!transport) return { ok: false, mode: 'none' };
  await transport.verify();
  return { ok: true, mode };
}
