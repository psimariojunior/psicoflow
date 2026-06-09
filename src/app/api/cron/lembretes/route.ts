import { NextResponse } from "next/server"
import { processPendingNotifications } from "@/lib/notifications"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
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
