import { NextResponse } from "next/server"
import { processPendingNotifications } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"
import { sendWhatsAppMessage } from "@/lib/whatsapp"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { z } from "zod"

export const dynamic = "force-dynamic"

const rateLimit = rateLimitMiddleware(10, 60000)

function checkAuth(request: Request): { authorized: boolean; url: URL } {
  const url = new URL(request.url)
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return { authorized: false, url }

  const providedSecret = url.searchParams.get("secret") || request.headers.get("x-cron-secret") || ""
  return { authorized: providedSecret === cronSecret, url }
}

export async function GET(request: Request) {
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const { authorized, url } = checkAuth(request)
  if (!authorized) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    if (url.searchParams.has("testemail")) {
      const to = url.searchParams.get("to") || ""
      if (!to) return NextResponse.json({ ok: false, error: "?to=email" })
      const err = await sendEmail(to, "Teste PsiHumanis", "<p>Teste de email</p>")
      return NextResponse.json({ ok: err === null, error: err })
    }

    if (url.searchParams.has("testwhatsapp")) {
      const to = url.searchParams.get("to") || ""
      if (!to) return NextResponse.json({ ok: false, error: "?to=phone" })
      const ok = await sendWhatsAppMessage(to, "lembrete_consulta", ["Paciente Teste", "11 de Junho de 2026", "14:30"])
      return NextResponse.json({ ok, error: ok ? null : "Falha no envio do WhatsApp" })
    }

    const force = url.searchParams.get("force") === "true"
    const result = await processPendingNotifications(force)
    return NextResponse.json({
      ok: true,
      processed: result.sent + result.failed,
      sent: result.sent,
      failed: result.failed,
    })
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
