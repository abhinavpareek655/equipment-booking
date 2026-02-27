// app/api/auth/forgot-password/route.ts

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { rateLimiter } from "@/lib/rateLimiter";

/**
 * Extract IP address from request headers
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

export async function POST(request: Request) {
  await dbConnect();

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 }
    );
  }

  const { email } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { message: "Email is required" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Validate email format
  if (!/^[\w-]+(\.[\w-]+)*@curaj\.ac\.in$/.test(normalizedEmail)) {
    return NextResponse.json(
      { message: "Please use a valid university email address" },
      { status: 400 }
    );
  }

  // Rate limiting: 3 requests per email per 15 minutes
  const emailLimit = rateLimiter.checkRateLimit(
    `forgot-pwd-email:${normalizedEmail}`,
    3,
    15 * 60 * 1000
  );

  if (!emailLimit) {
    const retryAfter = rateLimiter.getRateLimitReset(`forgot-pwd-email:${normalizedEmail}`);
    return NextResponse.json(
      { message: `Too many password reset attempts. Please try again in ${retryAfter} seconds.` },
      { status: 429 }
    );
  }

  // IP-based rate limiting: 10 requests per IP per 15 minutes (DDoS protection)
  const clientIP = getClientIP(request);
  const ipLimit = rateLimiter.checkRateLimit(
    `forgot-pwd-ip:${clientIP}`,
    10,
    15 * 60 * 1000
  );

  if (!ipLimit) {
    const retryAfter = rateLimiter.getRateLimitReset(`forgot-pwd-ip:${clientIP}`);
    return NextResponse.json(
      { message: `Too many requests from your network. Please try again in ${retryAfter} seconds.` },
      { status: 429 }
    );
  }

  try {
    // Check if user exists - but don't reveal this to prevent enumeration
    const user = await User.findOne({ email: normalizedEmail });

    // Generate OTP only if user exists
    let otpCode = "";
    if (user) {
      // Generate 6-digit OTP
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = await bcrypt.hash(otpCode, 10);

      // Delete any existing reset tokens for this email
      await PasswordResetToken.deleteMany({ email: normalizedEmail });

      // Create new reset token (expires in 10 minutes)
      await PasswordResetToken.create({
        email: normalizedEmail,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        attempts: 0,
      });

      // Send OTP email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Equipment Booking System" <${process.env.SMTP_USER}>`,
        to: normalizedEmail,
        subject: "Password Reset Request - OTP Verification",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>We received a request to reset your password for the Equipment Booking System. Use the OTP code below to proceed:</p>
                  
                  <div class="otp-box">
                    <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
                    <div class="otp-code">${otpCode}</div>
                  </div>

                  <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                      <li>This OTP is valid for <strong>10 minutes</strong> only</li>
                      <li>Do not share this code with anyone</li>
                      <li>If you didn't request this, please ignore this email</li>
                    </ul>
                  </div>

                  <p>After verifying the OTP, you'll be able to set a new password for your account.</p>
                  
                  <p style="margin-top: 30px;">Best regards,<br><strong>Equipment Booking System Team</strong></p>
                </div>
                <div class="footer">
                  <p>This is an automated email. Please do not reply to this message.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    // Always return success to prevent user enumeration
    // This prevents attackers from discovering valid email addresses
    return NextResponse.json({
      success: true,
      message: "If your email is registered, you will receive a password reset OTP shortly.",
    }, { status: 200 });

  } catch (err) {
    console.error("[FORGOT PASSWORD] Error:", err);
    // Generic error message to prevent information leakage
    return NextResponse.json(
      { message: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
