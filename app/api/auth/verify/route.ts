// app/api/verify/route.ts

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import VerificationCode from "@/models/VerificationCode";
import User from "@/models/User";
import bcrypt from "bcrypt";

interface VerifyRequest {
  email: string;
  otp: string;
}

export async function POST(request: Request) {
  await dbConnect();
  const { email, otp }: VerifyRequest = await request.json();

  if (!email || !otp) {
    return NextResponse.json(
      { message: "Email and OTP are required" },
      { status: 400 }
    );
  }

  try {
    const record = await VerificationCode.findOne({ email });
    if (!record) {
      return NextResponse.json(
        { message: "No OTP request found for this email" },
        { status: 400 }
      );
    }

    if (Date.now() > record.expiresAt.getTime()) {
      return NextResponse.json(
        { message: "OTP has expired" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(otp, record.codeHash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Extract all required fields from the verification record
    const { name, passwordHash, role, department } = record;
    if (!name || !passwordHash || !role || !department) {
      return NextResponse.json(
        { message: "Missing user data in verification record" },
        { status: 500 }
      );
    }

    // Create the new user
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role,
      department,
    });

    // Clean up the verification record
    await VerificationCode.deleteOne({ email });

    return NextResponse.json(
      { message: "Registration successful", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[VERIFY] Error:", error);
    return NextResponse.json(
      { message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
