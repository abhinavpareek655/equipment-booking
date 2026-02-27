// app/api/user/profile/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { writeFile, unlink } from "fs/promises";
import path from "path";

// GET /api/user/profile - Get user profile
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await dbConnect();
    
    const user = await User.findById(payload.userId).lean() as any;
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      profilePhoto: user.profilePhoto,
      supervisor: user.supervisor,
      supervisorEmail: user.supervisorEmail,
    }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}

// PUT /api/user/profile - Update user profile (name and photo only)
export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await dbConnect();
    
    const contentType = request.headers.get("content-type");
    
    // Handle FormData (for profile photo upload)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const name = formData.get("name") as string | null;
      const photo = formData.get("profilePhoto") as File | null;

      const user = await User.findById(payload.userId);
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      // Update name if provided
      if (name && name.trim()) {
        user.name = name.trim();
      }

      // Update profile photo if provided
      if (photo) {
        // Delete old photo if exists
        if (user.profilePhoto) {
          try {
            const oldPhotoPath = path.join(process.cwd(), "public", user.profilePhoto);
            await unlink(oldPhotoPath);
          } catch (err) {
            console.log("[PROFILE] Could not delete old photo:", err);
          }
        }

        const buffer = Buffer.from(await photo.arrayBuffer());
        const filename = `${Date.now()}-${payload.userId}.jpg`;
        const filepath = path.join(process.cwd(), "public", "uploads", "images", filename);
        
        await writeFile(filepath, buffer);
        user.profilePhoto = `/uploads/images/${filename}`;
      }

      await user.save();

      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          name: user.name,
          profilePhoto: user.profilePhoto,
        },
      }, { status: 200 });
    } 
    
    // Handle JSON (for name only update)
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.name = name.trim();
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Name updated successfully",
      user: { name: user.name },
    }, { status: 200 });
  } catch (err) {
    console.error("[PROFILE UPDATE] Error:", err);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/profile - Delete user account
export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await dbConnect();
    
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete profile photo if exists
    if (user.profilePhoto) {
      try {
        const photoPath = path.join(process.cwd(), "public", user.profilePhoto);
        await unlink(photoPath);
      } catch (err) {
        console.log("[DELETE ACCOUNT] Could not delete photo:", err);
      }
    }

    // Delete user account
    await User.findByIdAndDelete(payload.userId);

    // Clear the auth token
    const response = NextResponse.json(
      { success: true, message: "Account deleted successfully" },
      { status: 200 }
    );
    response.cookies.delete("token");

    return response;
  } catch (err) {
    console.error("[DELETE ACCOUNT] Error:", err);
    return NextResponse.json(
      { message: "Failed to delete account" },
      { status: 500 }
    );
  }
}
