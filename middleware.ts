// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

// which URLs require a logged-in user
const protectedPaths = ["/dashboard/:path*"]
// which URLs should redirect away if already logged-in
const authPaths      = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const rawToken = request.cookies.get("auth_token")?.value

  // safely check the token
  let isAuthenticated = false
  if (rawToken) {
    try {
      verifyToken(rawToken)
      isAuthenticated = true
    } catch (err) {
      // invalid or expired
      isAuthenticated = false
    }
  }

  // 1️⃣ Protected routes ➔ redirect to login if not authed
  if (!isAuthenticated && protectedPaths.some(p => request.nextUrl.pathname.match(new RegExp(`^${p.replace(/\:\w+\*/g, ".*")}$`)))) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2️⃣ Auth pages (login/register) ➔ redirect to dashboard if already authed
  if (isAuthenticated && authPaths.some(p => pathname === p)) {
    const dashUrl = request.nextUrl.clone()
    dashUrl.pathname = "/dashboard"
    return NextResponse.redirect(dashUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
}
