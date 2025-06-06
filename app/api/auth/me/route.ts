// app/api/auth/me/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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
    // 3. Return the payload (e.g., { userId, name, email, role, department })
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
