import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const LIVEKIT_WS = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://gestao-de-psicologia-sx5sdgua.livekit.cloud"

const publicPages = [
  "/", "/robots.txt", "/sitemap.xml", "/manifest.webmanifest",
  "/termos", "/privacidade", "/login", "/register", "/recuperar-senha",
]

const publicPrefixes = [
  "/reset-password", "/sala-virtual/entrar", "/agendar", "/paciente",
]

const publicApiPrefixes = [
  "/api/auth", "/api/livekit", "/api/disponibilidade/public",
  "/api/agendamentos/public", "/api/pacientes/auth",
  "/api/pacientes/agendamentos", "/api/pacientes/diario",
  "/api/pacientes/me", "/api/pacientes/invoices",
  "/api/cron", "/api/health",
]

const staticPrefixes = ["/_next", "/static"]

function isPublic(pathname: string): boolean {
  if (publicPages.includes(pathname)) return true
  if (publicPrefixes.some((p) => pathname.startsWith(p))) return true
  return false
}

function isPublicApi(pathname: string): boolean {
  if (publicApiPrefixes.some((p) => pathname.startsWith(p))) return true
  return false
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (!token && !isPublic(pathname) && !isPublicApi(pathname)) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const response = NextResponse.next()

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
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        `connect-src 'self' ${LIVEKIT_WS} https://api.sendgrid.com https://api.resend.com https://graph.facebook.com https://api.livekit.cloud https://gestao-de-psicologia-sx5sdgua.livekit.cloud wss://gestao-de-psicologia-sx5sdgua.livekit.cloud`,
        "media-src 'self' blob: mediastream:",
        "worker-src 'self' blob:",
        "child-src 'self' blob:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")
    )

    if (process.env.NODE_ENV === "production") {
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
        if (isPublicApi(pathname) || staticPrefixes.some((p) => pathname.startsWith(p)) || isPublic(pathname)) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)"],
}
