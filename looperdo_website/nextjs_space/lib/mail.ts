import nodemailer from 'nodemailer';

// Configure the Hostinger SMTP connection
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"LooperDo Support" <support@looperdo.com>',
    to: email,
    subject: "Confirm your email address - LooperDo",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #2563eb;">Welcome to LooperDo!</h2>
        <p>Please confirm your email address by clicking the button below.</p>
        <a href="${confirmLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Verify Email</a>
        <p style="margin-top: 30px; font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: '"LooperDo Support" <support@looperdo.com>',
    to: email,
    subject: "Reset your password - LooperDo",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #ea580c;">Password Reset Request</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #ea580c; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Reset Password</a>
      </div>
    `,
  });
};