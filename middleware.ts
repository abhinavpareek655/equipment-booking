import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function getPayload(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    return payload as any;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS headers for API routes
  if (pathname.startsWith("/api")) {
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    res.headers.set("Access-Control-Allow-Headers", "*");

    // Role checks for protected APIs
    if (pathname.startsWith("/api/admin")) {
      const payload = await getPayload(request.cookies.get("token")?.value);
      if (!payload || (payload.role !== "Admin" && payload.role !== "Super-admin")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    } else if (pathname.startsWith("/api/super-admin")) {
      const payload = await getPayload(request.cookies.get("token")?.value);
      if (!payload || payload.role !== "Super-admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    return res;
  }

  // Protect admin pages
  if (pathname.startsWith("/admin")) {
    const payload = await getPayload(request.cookies.get("token")?.value);
    if (!payload || (payload.role !== "Admin" && payload.role !== "Super-admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect super admin pages
  if (pathname.startsWith("/super-admin")) {
    const payload = await getPayload(request.cookies.get("token")?.value);
    if (!payload || payload.role !== "Super-admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/super-admin/:path*"]
};
