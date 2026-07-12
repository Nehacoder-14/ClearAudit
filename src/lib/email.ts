import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const from = process.env.EMAIL_FROM || 'ClearAudit <noreply@clearaudit.app>';

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER) {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[Email Dev] To: ${to} | Subject: ${subject}`);
      console.info(html);
    }
    return;
  }

  await transporter.sendMail({ from, to, subject, html });
}

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verifyUrl = `${appUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmail(
    email,
    'Verify your ClearAudit account',
    `
    <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
      <h1 style="color: #4F46E5; font-size: 24px;">Welcome to ClearAudit</h1>
      <p>Hi ${name},</p>
      <p>Thanks for signing up. Please verify your email to start auditing your contracts.</p>
      <a href="${verifyUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
        Verify Email
      </a>
      <p style="color: #64748B; font-size: 14px;">This link expires in 24 hours.</p>
    </div>
    `
  );
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmail(
    email,
    'Reset your ClearAudit password',
    `
    <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
      <h1 style="color: #4F46E5; font-size: 24px;">Password Reset</h1>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click below to choose a new one.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #64748B; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
    `
  );
}

export async function sendAlertEmail(email: string, subject: string, message: string) {
  await sendEmail(
    email,
    subject,
    `
    <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
      <h1 style="color: #F59E0B; font-size: 20px;">Contract Alert</h1>
      <p>${message}</p>
      <a href="${appUrl}/dashboard" style="display: inline-block; background: #4F46E5; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
        View Dashboard
      </a>
    </div>
    `
  );
}
