import { NextResponse } from "next/server"
import { processPendingNotifications } from "@/lib/notifications"

export async function GET() {
  try {
    const result = await processPendingNotifications()
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

export async function POST() {
  return GET()
}
