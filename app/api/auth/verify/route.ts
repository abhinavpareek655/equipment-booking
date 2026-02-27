// app/api/verify/route.ts

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import VerificationCode from "@/models/VerificationCode";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface VerifyRequest {
  email: string;
  otp: string;
  supervisorOtp?: string;
}

export async function POST(request: Request) {
  await dbConnect();
  const { email, otp, supervisorOtp }: VerifyRequest = await request.json();

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

    // Verify user OTP
    const isValid = await bcrypt.compare(otp, record.codeHash);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // If supervisor email exists, verify supervisor OTP as well
    if (record.supervisorEmail && record.supervisorCodeHash) {
      if (!supervisorOtp) {
        return NextResponse.json(
          { message: "Supervisor OTP is required for account activation" },
          { status: 400 }
        );
      }

      const isSupervisorValid = await bcrypt.compare(supervisorOtp, record.supervisorCodeHash);
      if (!isSupervisorValid) {
        return NextResponse.json(
          { message: "Invalid supervisor OTP" },
          { status: 400 }
        );
      }

      // Verify that the supervisor email belongs to an admin or super-admin user
      const supervisorUser = await User.findOne({ email: record.supervisorEmail }).lean() as any;
      if (!supervisorUser) {
        return NextResponse.json(
          { message: "Supervisor email is not registered in the system" },
          { status: 400 }
        );
      }

      if (supervisorUser?.role !== "admin" && supervisorUser?.role !== "super-admin") {
        return NextResponse.json(
          { message: "The provided supervisor email does not have admin privileges" },
          { status: 403 }
        );
      }
    }

    const { name, passwordHash, role, department, supervisor, supervisorEmail } = record;
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
      supervisor,
      supervisorEmail,
    });

    // Clean up the verification record
    await VerificationCode.deleteOne({ email });

    // Sign a JWT that includes userId and additional claims
    const token = jwt.sign(
      {
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Send response with HTTP-only cookie
    const response = NextResponse.json(
      { message: "Registration successful", userId: newUser._id },
      { status: 201 }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("[VERIFY] Error:", error);
    return NextResponse.json(
      { message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
