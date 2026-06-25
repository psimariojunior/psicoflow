import { NextResponse } from "next/server"

export function validateOrigin(request: Request): { allowed: boolean; error?: NextResponse } {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")

  const isDev = process.env.NODE_ENV !== "production"

  if (isDev) {
    return { allowed: true }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://psihumanis.com.br"

  const allowedOrigins = [
    appUrl.replace(/\/$/, ""),
    "https://psihumanis.com.br",
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
