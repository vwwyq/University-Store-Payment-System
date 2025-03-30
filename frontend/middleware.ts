import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of public routes that don't require authentication
const publicRoutes = ["/", "/login", "/signup"]

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname

  // Check if the path is in the public routes
  const isPublicRoute = publicRoutes.includes(path)

  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value

  // If the route is not public and there's no token, redirect to login
  if (!isPublicRoute && !token) {
    const url = new URL("/login", request.url)
    // Add the original URL as a query parameter to redirect after login
    url.searchParams.set("redirect", path)
    return NextResponse.redirect(url)
  }

  // If the user is logged in and trying to access login/signup, redirect to dashboard
  if (token && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}

