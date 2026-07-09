import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "grand_stay_management_secret_key_1234567890"
  });

  const { pathname } = request.nextUrl;

  // 1. If user is trying to access dashboard paths
  if (pathname.startsWith("/dashboard")) {
    // If not authenticated, redirect to login page
    if (!token) {
      const url = new URL("/login", request.url);
      return NextResponse.redirect(url);
    }

    // Role-based page access checks
    const role = token.role;

    // Define allowed paths by role
    if (pathname.startsWith("/dashboard/staff")) {
      if (role !== "General Manager") {
        return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
      }
    }

    if (pathname.startsWith("/dashboard/analytics")) {
      if (role !== "General Manager") {
        return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
      }
    }

    if (pathname.startsWith("/dashboard/rooms") || pathname.startsWith("/dashboard/bookings") || pathname.startsWith("/dashboard/customers")) {
      if (role !== "General Manager" && role !== "Receptionist") {
        return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
      }
    }

    if (pathname.startsWith("/dashboard/maintenance")) {
      if (role !== "General Manager" && role !== "Housekeeping") {
        return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
      }
    }
  }

  // 2. If logged-in user tries to go to login page, redirect to dashboard
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login"
  ]
};
