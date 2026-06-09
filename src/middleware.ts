import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (!token && pathname !== "/login" && pathname !== "/register" && pathname !== "/recuperar-senha" && !pathname.startsWith("/sala-virtual/entrar")) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const response = NextResponse.next()

    // Security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set(
      "Permissions-Policy",
      "camera=(self), microphone=(self), geolocation=()"
    )
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss: http: https:; media-src 'self' blob: mediastream:; worker-src 'self' blob:; child-src 'self' blob:;"
    )

    const isProduction = process.env.NODE_ENV === "production"
    if (isProduction) {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      )
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/webrtc") || pathname.startsWith("/_next") || pathname.startsWith("/static")) {
          return true
        }
        if (pathname === "/login" || pathname === "/register" || pathname === "/recuperar-senha" || pathname.startsWith("/reset-password") || pathname.startsWith("/sala-virtual/entrar")) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
