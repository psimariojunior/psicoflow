import { NextRequest, NextResponse } from "next/server"
import { getVapidPublicKey } from "@/lib/push"

export const dynamic = "force-dynamic"

export async function GET() {
  const key = getVapidPublicKey()
  if (!key) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 501 })
  }
  return NextResponse.json({ publicKey: key })
}
