// app/api/auth/me/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  // 1. Read the token from the HTTP-only "token" cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Verify the token and extract payload
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    // 3. Fetch user from DB to get profilePhoto
    await dbConnect();
    const user = await User.findById(payload.userId).lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    // Return user info including profilePhoto
    return NextResponse.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      profilePhoto: user.profilePhoto,
      supervisor: user.supervisor,
    }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
