// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  // Remove the “token” cookie
  res.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
