import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import fs from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  await dbConnect();

  const formData = await request.formData();
  const email = formData.get("email") as string;
  const file = formData.get("profilePhoto") as File | null;

  if (!email || !file) {
    return NextResponse.json({ success: false, message: "Email and profile photo are required." }, { status: 400 });
  }

  // Validate file size (max 1MB)
  if (file.size > 1024 * 1024) {
    return NextResponse.json({ success: false, message: "File size must be less than 1MB." }, { status: 400 });
  }

  // Find user to get userId for unique file name
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
  }
  const userId = user._id.toString();

  // Save file to /public/uploads/images/
  const uploadDir = path.join(process.cwd(), "public", "uploads", "images");
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${userId}-${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, fileName);

  // Read file as buffer and write to disk
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  // Store relative path for serving via /public
  const photoPath = `/uploads/images/${fileName}`;

  // Update user in DB
  try {
    user.profilePhoto = photoPath;
    await user.save();
    return NextResponse.json({ success: true, message: "Profile photo uploaded.", profilePhoto: photoPath }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Failed to update user." }, { status: 500 });
  }
} 