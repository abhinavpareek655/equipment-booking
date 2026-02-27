// app/api/register/route.ts

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import VerificationCode from "@/models/VerificationCode";
import User from "@/models/User";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { isAllowedFacultyEmail } from "@/lib/allowed-faculty";

type RegisterRequest = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  department?: string;
  supervisor?: string;
  supervisorEmail?: string;
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

  const { name, email, password, role, department, supervisor, supervisorEmail } = body;

  if (!name || !email || !password || !role || !department) {
    return NextResponse.json(
      { success: false, message: "Name, email, password, role, and department are required." },
      { status: 400 }
    );
  }

  // supervisorEmail is required now
  if (!supervisorEmail) {
    return NextResponse.json(
      { success: false, message: "Supervisor email is required for account approval." },
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

    // Verify that the supervisor email exists and has admin/super-admin role
    const supervisorUser = await User.findOne({ email: supervisorEmail }).lean() as any;
    if (!supervisorUser) {
      return NextResponse.json(
        { success: false, message: "The supervisor email is not registered in the system. Please ensure your supervisor has an active account." },
        { status: 400 }
      );
    }

    if (supervisorUser?.role !== "Admin" && supervisorUser?.role !== "Super-admin") {
      return NextResponse.json(
        { success: false, message: "The provided supervisor email does not have admin privileges. Only admins can approve new registrations." },
        { status: 403 }
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
  const supervisorCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  console.log("[REGISTER] Generated OTP code for user:", code);
  console.log("[REGISTER] Generated OTP code for supervisor:", supervisorCode);

  let codeHash: string;
  let supervisorCodeHash: string;
  let passwordHash: string;
  try {
    codeHash = await bcrypt.hash(code, 10);
    supervisorCodeHash = await bcrypt.hash(supervisorCode, 10);
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
        supervisor,
        supervisorEmail,
        supervisorCodeHash,
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

  // 7) Send OTPs via email to both user and supervisor
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

    // Email template for user
    const userEmailTemplate = `
      <div style="background-color: #f4f4f4; padding: 40px 0; font-family: Arial, sans-serif;">
      <div style="max-width: 520px; margin: auto; background-color: #ffffff; padding: 30px 40px; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
        
        <div style="text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #1DB954; margin-bottom: 10px;">DBT BUILDER</div>
        <h2 style="color: #222; font-size: 20px; margin: 10px 0;">Verify Your Email</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
          Please use the code below to verify your email address. This helps us confirm your identity.
        </p>

        <div style="display: inline-block; font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #1DB954; background-color: #f0f8ff; padding: 14px 28px; border-radius: 10px;">
          ${code}
        </div>

        <p style="color: #777; font-size: 13px; margin-top: 30px; line-height: 1.5;">
          This code is valid for 10 minutes. Your account activation also requires approval from your supervisor/PI. If you did not request this, you can safely ignore this email.
        </p>
        </div>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />

        <div style="text-align: center; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} Central University of Rajasthan. All rights reserved.
        </div>
      </div>
      </div>
    `;

    // Email template for supervisor
    const supervisorEmailTemplate = `
      <div style="background-color: #f4f4f4; padding: 40px 0; font-family: Arial, sans-serif;">
      <div style="max-width: 520px; margin: auto; background-color: #ffffff; padding: 30px 40px; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.1);">
        
        <div style="text-align: center;">
        <div style="font-size: 28px; font-weight: 700; color: #1DB954; margin-bottom: 10px;">DBT BUILDER</div>
        <h2 style="color: #222; font-size: 20px; margin: 10px 0;">Account Approval Request</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
          A new user has registered under your supervision. Please verify this registration by using the code below:
        </p>

        <p style="color: #333; font-size: 14px; margin-bottom: 16px;">
          <strong>User Name:</strong> ${name}<br>
          <strong>User Email:</strong> ${email}<br>
          <strong>Department:</strong> ${department}<br>
          <strong>Role:</strong> ${role}
        </p>

        <p style="color: #555; font-size: 15px; margin-bottom: 16px;">
          Please use the code below to verify and approve this registration:
        </p>

        <div style="display: inline-block; font-size: 30px; font-weight: bold; letter-spacing: 6px; color: #1DB954; background-color: #f0f8ff; padding: 14px 28px; border-radius: 10px;">
          ${supervisorCode}
        </div>

        <p style="color: #777; font-size: 13px; margin-top: 30px; line-height: 1.5;">
          This code is valid for 10 minutes. If you did not expect this, or if this person is not under your supervision, you can safely ignore this email.
        </p>
        </div>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />

        <div style="text-align: center; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} Central University of Rajasthan. All rights reserved.
        </div>
      </div>
      </div>
    `;

    // Send email to user
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "OTP for Account Verification",
      html: userEmailTemplate
    });

    // Send email to supervisor
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: supervisorEmail,
      subject: "Account Approval Required - DBT BUILDER",
      html: supervisorEmailTemplate
    });

    console.log("[REGISTER] ✉️ Emails sent to both user and supervisor");
  } catch (err) {
    console.error("[REGISTER] ✉️ Email send error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP emails" },
      { status: 500 }
    );
  }

  // 8) Finally, return a 200‐OK JSON response
  return NextResponse.json({ success: true, message: "OTPs sent to user and supervisor" }, { status: 200 });
}
