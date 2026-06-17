import { NextResponse } from "next/server"

export function validateOrigin(request: Request): { allowed: boolean; error?: NextResponse } {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")

  const isDev = process.env.NODE_ENV !== "production"

  if (isDev) {
    return { allowed: true }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://psicoflow-iota.vercel.app"

  const allowedOrigins = [
    appUrl.replace(/\/$/, ""),
    "https://psicoflow-iota.vercel.app",
  ]

  if (origin && !allowedOrigins.includes(origin)) {
    return {
      allowed: false,
      error: NextResponse.json({ error: "Origem não autorizada" }, { status: 403 }),
    }
  }

  if (referer && !allowedOrigins.some((a) => referer.startsWith(a))) {
    return {
      allowed: false,
      error: NextResponse.json({ error: "Origem não autorizada" }, { status: 403 }),
    }
  }

  return { allowed: true }
}
