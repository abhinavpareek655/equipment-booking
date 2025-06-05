// app/api/register/route.ts

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import VerificationCode from "@/models/VerificationCode";
import User from "@/models/User";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

type RegisterRequest = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  department?: string;
};

export async function POST(request: Request) {
  await dbConnect();

  let body: RegisterRequest;
  try {
    body = (await request.json()) as RegisterRequest;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { name, email, password, role, department } = body;

  if (!name || !email || !password || !role || !department) {
    return NextResponse.json(
      { success: false, message: "Name, email, password, role, and department are required." },
      { status: 400 }
    );
  }

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

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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

  try {
    await VerificationCode.findOneAndUpdate(
      { email },
      {
        email,
        codeHash,
        name,
        passwordHash,
        role,
        department,
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
      <div style="background-color: #f4f4f4; padding: 40px 0; font-family: Arial, sans-serif;">
        <div style="max-width: 520px; margin: auto; background-color: #ffffff; padding: 30px 40px; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
          
          <div style="text-align: center;">
            <img src="cid:curaj-logo" alt="CURaj Logo" style="width: 100px; height: auto; margin-bottom: 16px;" />
            <div style="font-size: 28px; font-weight: 700; color: #1DB954; margin-bottom: 10px;">DBT BUILDER</div>
            <h2 style="color: #222; font-size: 20px; margin: 10px 0;">Verify Your Email</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
              Please use the code below to verify your email address. This helps us confirm your identity.
            </p>

            <div style="display: inline-block; font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #1DB954; background-color: #f0f8ff; padding: 14px 28px; border-radius: 10px;">
              ${code}
            </div>

            <p style="color: #777; font-size: 13px; margin-top: 30px; line-height: 1.5;">
              This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.
            </p>
          </div>

          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />

          <div style="text-align: center; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} Central University of Rajasthan. All rights reserved.
          </div>
        </div>
      </div>
      `,
      attachments: [
      {
        filename: "curaj-logo.png",
        path: process.cwd() + "/public/images/curaj-logo.png",
        cid: "curaj-logo" // same as in the img src above
      }
      ]
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
