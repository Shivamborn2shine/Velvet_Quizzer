import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Protect /admin routes
    if (path.startsWith("/admin")) {
        // Exclude /admin/login from protection
        if (path === "/admin/login") {
            return NextResponse.next();
        }

        // Check for auth cookie
        const token = request.cookies.get("admin_token");

        if (!token) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/admin/:path*",
};
