import { NextResponse } from "next/server"
import { processPendingNotifications } from "@/lib/notifications"
import { Resend } from "resend"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)

    if (url.searchParams.has("testresend")) {
      const to = url.searchParams.get("to") || ""
      if (!to) return NextResponse.json({ ok: false, error: "?to=email" })
      const apiKey = process.env.RESEND_API_KEY
      const from = process.env.EMAIL_FROM || "PsicoFlow <onboarding@resend.dev>"
      const resend = new Resend(apiKey || "")
      const result = await resend.emails.send({ from, to: [to], subject: "Teste PsicoFlow", html: "<p>Teste via Resend</p>" })
      return NextResponse.json({ ok: true, result })
    }

    const force = url.searchParams.get("force") === "true"
    const result = await processPendingNotifications(force)
    return NextResponse.json({
      ok: true,
      processed: result.sent + result.failed,
      sent: result.sent,
      failed: result.failed,
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
