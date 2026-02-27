// app/api/auth/reset-password/route.ts

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import bcrypt from "bcrypt";
import { rateLimiter } from "@/lib/rateLimiter";

interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

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

  let body: ResetPasswordRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 }
    );
  }

  const { email, otp, newPassword } = body;

  if (!email || !otp || !newPassword) {
    return NextResponse.json(
      { message: "Email, OTP, and new password are required" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Validate password strength
  if (newPassword.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters long" },
      { status: 400 }
    );
  }

  // Check if email is locked out due to too many failed attempts
  const lockStatus = rateLimiter.isLockedOut(`reset-pwd:${normalizedEmail}`);
  if (lockStatus.locked) {
    return NextResponse.json(
      { message: `Too many failed attempts. Account locked for ${lockStatus.seconds} seconds.` },
      { status: 429 }
    );
  }

  // IP-based rate limiting for verification attempts (DDoS protection)
  const clientIP = getClientIP(request);
  const ipLimit = rateLimiter.checkRateLimit(
    `reset-verify-ip:${clientIP}`,
    20,
    15 * 60 * 1000 // 20 attempts per 15 minutes per IP
  );

  if (!ipLimit) {
    const retryAfter = rateLimiter.getRateLimitReset(`reset-verify-ip:${clientIP}`);
    return NextResponse.json(
      { message: `Too many verification attempts from your network. Try again in ${retryAfter} seconds.` },
      { status: 429 }
    );
  }

  try {
    // Find the reset token
    const resetToken = await PasswordResetToken.findOne({ email: normalizedEmail });

    if (!resetToken) {
      // Record failed attempt
      const attemptResult = rateLimiter.recordFailedAttempt(`reset-pwd:${normalizedEmail}`);
      if (!attemptResult.allowed) {
        return NextResponse.json(
          { message: `Too many failed attempts. Try again in ${attemptResult.lockedSeconds} seconds.` },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > resetToken.expiresAt) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id });
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check attempts limit (max 5 attempts per token)
    if (resetToken.attempts >= 5) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id });
      rateLimiter.recordFailedAttempt(`reset-pwd:${normalizedEmail}`);
      return NextResponse.json(
        { message: "Maximum verification attempts exceeded. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Verify OTP
    const isValidOTP = await bcrypt.compare(otp, resetToken.codeHash);

    if (!isValidOTP) {
      // Increment failed attempts in database
      resetToken.attempts++;
      await resetToken.save();

      // Record failed attempt for brute force protection
      const attemptResult = rateLimiter.recordFailedAttempt(`reset-pwd:${normalizedEmail}`);
      const remaining = 5 - resetToken.attempts;

      if (!attemptResult.allowed) {
        return NextResponse.json(
          { message: `Too many failed attempts. Try again in ${attemptResult.lockedSeconds} seconds.` },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 400 }
      );
    }

    // OTP is valid - update user's password
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // This shouldn't happen, but handle it gracefully
      await PasswordResetToken.deleteOne({ _id: resetToken._id });
      return NextResponse.json(
        { message: "User account not found" },
        { status: 404 }
      );
    }

    // Hash new password and update
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newPasswordHash;
    await user.save();

    // Delete the used reset token
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    // Clear failed attempts from rate limiter
    rateLimiter.clearFailedAttempts(`reset-pwd:${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    }, { status: 200 });

  } catch (err) {
    console.error("[RESET PASSWORD] Error:", err);
    return NextResponse.json(
      { message: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
