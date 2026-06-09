import { NextResponse } from "next/server"
import { processPendingNotifications } from "@/lib/notifications"
import nodemailer from "nodemailer"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)

    if (url.searchParams.get("test") === "smtp") {
      const user = process.env.SMTP_USER
      const pass = process.env.SMTP_PASS
      const host = process.env.SMTP_HOST || "smtp-mail.outlook.com"
      const port = parseInt(process.env.SMTP_PORT || "587", 10)
      const to = url.searchParams.get("to") || user || "test@test.com"
      const errors: string[] = []
      let verified = false

      if (!user || !pass) {
        return NextResponse.json({ ok: false, error: "SMTP_USER or SMTP_PASS not set" })
      }

      try {
        const transport = nodemailer.createTransport({
          host,
          port,
          secure: false,
          requireTLS: true,
          auth: { user, pass },
          tls: { rejectUnauthorized: true },
        })
        verified = await transport.verify()
        await transport.sendMail({ from: user, to, subject: "Teste PsicoFlow", html: "<p>Teste de envio</p>" })
        return NextResponse.json({ ok: true, verified, sent: true, to, host, port })
      } catch (err: any) {
        return NextResponse.json({
          ok: false,
          verified,
          error: err.message || String(err),
          code: err.code,
          command: err.command,
          response: err.response,
          responseCode: err.responseCode,
        })
      }
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
