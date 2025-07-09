import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

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

  // Rate limiting for sensitive endpoints
  if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/register")) {
    const identifier = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "unknown";
    const isAllowed = checkRateLimit(identifier, 5, 15 * 60 * 1000); // 5 requests per 15 minutes
    
    if (!isAllowed) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  // CORS headers for API routes with proper configuration
  if (pathname.startsWith("/api")) {
    const res = NextResponse.next();
    
    // Restrict CORS to specific origins in production
    const allowedOrigins = process.env.NODE_ENV === "production" 
      ? [process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"]
      : ["http://localhost:3000", "http://127.0.0.1:3000"];
    
    const origin = request.headers.get("origin");
    if (origin && allowedOrigins.includes(origin)) {
      res.headers.set("Access-Control-Allow-Origin", origin);
    }
    
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.headers.set("Access-Control-Allow-Credentials", "true");

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
