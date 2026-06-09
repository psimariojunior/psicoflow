import { NextResponse } from "next/server"
import { processPendingNotifications } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)

    if (url.searchParams.has("testbrevo")) {
      const to = url.searchParams.get("to") || ""
      if (!to) return NextResponse.json({ ok: false, error: "?to=email" })
      const err = await sendEmail(to, "Teste PsicoFlow", "<p>Teste via Brevo</p>")
      return NextResponse.json({ ok: err === null, error: err })
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
