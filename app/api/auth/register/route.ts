// app/api/register/route.ts

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import VerificationCode from "@/models/VerificationCode";
import User from "@/models/User";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// We won’t rely on TypeScript’s destructuring‐with‐type annotation here, 
// because `req.json()` can return anything. Instead, read it into a plain object:
type RegisterRequest = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  // 1) Connect to MongoDB
  await dbConnect();

  // 2) Safely parse JSON
  let body: RegisterRequest;
  try {
    body = (await request.json()) as RegisterRequest;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { name, email, password } = body;

  // 3) Basic field validation
  if (!name || !email || !password) {
    return NextResponse.json(
      { success: false, message: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  // 4) Check if this email is already registered
  try {
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered." },
        { status: 409 }
      );
    }
  } catch (err) {
    console.error("[REGISTER] Database lookup error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }

  // 5) Generate a 6‐digit OTP and hash it
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 minutes

  let codeHash: string;
  let passwordHash: string;
  try {
    codeHash = await bcrypt.hash(code, 10);
    passwordHash = await bcrypt.hash(password, 10);
  } catch (err) {
    console.error("[REGISTER] Bcrypt hashing error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }

  // 6) Upsert into VerificationCode collection:
  try {
    await VerificationCode.findOneAndUpdate(
      { email },
      {
        email,
        codeHash,
        name,
        passwordHash,
        expiresAt,
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("[REGISTER] OTP upsert error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }

  // 7) Send the OTP via email
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT!),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "OTP for Account Verification",
      html: `
        <div style="background:#f4f4f4; padding:30px; font-family:Arial,sans-serif;">
          <div style="max-width:480px; margin:auto; background:#fff; padding:30px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <div style="text-align:center;">
              <h2 style="color:#222; font-size:22px; margin-bottom:10px;">Verify Your Email</h2>
              <p style="color:#555; font-size:16px;">Use this code to verify your account:</p>
              <div style="margin:20px auto; font-size:32px; font-weight:bold; letter-spacing:4px; color:#666; background:#f0f8ff; padding:15px 25px; border-radius:8px; display:inline-block;">
                ${code}
              </div>
              <p style="color:#777; font-size:14px; margin-top:30px;">This code expires in 10 minutes.</p>
            </div>
            <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />
            <div style="text-align:center; color:#aaa; font-size:12px;">
              © ${new Date().getFullYear()} Central University of Rajasthan. All rights reserved.
            </div>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("[REGISTER] ✉️ Email send error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP email" },
      { status: 500 }
    );
  }

  // 8) Finally, return a 200‐OK JSON response
  return NextResponse.json({ success: true, message: "OTP sent" }, { status: 200 });
}
