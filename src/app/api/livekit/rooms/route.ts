import { NextResponse } from "next/server"
import { RoomServiceClient, AccessToken } from "livekit-server-sdk"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function getLiveKitConfig() {
  const raw = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || ""
  const host = raw.replace("wss://", "https://").replace(/\/+$/, "")
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  return { host, apiKey: apiKey || "", apiSecret: apiSecret || "" }
}

export async function GET() {
  const { host, apiKey, apiSecret } = getLiveKitConfig()
  if (!host || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "LiveKit não configurado", host: !!host, key: !!apiKey, secret: !!apiSecret, raw: process.env.LIVEKIT_URL }, { status: 500 })
  }

  try {
    // Method 1: RoomServiceClient
    const client = new RoomServiceClient(host, apiKey, apiSecret)
    const rooms = await client.listRooms()
    return NextResponse.json({ method: "RoomServiceClient", rooms })
  } catch (e1) {
    // Method 2: direct API with JWT
    try {
      const at = new AccessToken(apiKey, apiSecret, { ttl: "5m" })
      at.addGrant({ roomCreate: true })
      const token = await at.toJwt()
      const res = await fetch(`${host}/api/v1/rooms`, { headers: { Authorization: `Bearer ${token}` } })
      const text = await res.text()
      return NextResponse.json({ method: "directAPI", status: res.status, body: text })
    } catch (e2) {
      return NextResponse.json({ error1: String(e1), error2: String(e2) }, { status: 500 })
    }
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { room } = await request.json()
    if (!room) {
      return NextResponse.json({ error: "Room name required" }, { status: 400 })
    }

    const { host, apiKey, apiSecret } = getLiveKitConfig()
    if (!host || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "LiveKit não configurado" }, { status: 500 })
    }

    console.log("deleteRoom attempt", { host, room })

    // Try RoomServiceClient first
    try {
      const client = new RoomServiceClient(host, apiKey, apiSecret)
      await client.deleteRoom(room)
      console.log("Room deleted via RoomServiceClient:", room)
      return NextResponse.json({ success: true })
    } catch (e1: any) {
      console.error("RoomServiceClient failed:", e1.message || e1)
      // Fallback: direct REST API with JWT
      try {
        const at = new AccessToken(apiKey, apiSecret, { ttl: "5m" })
        at.addGrant({ roomCreate: true })
        const token = await at.toJwt()

        const url = `${host}/api/v1/rooms/${encodeURIComponent(room)}`
        const res = await fetch(url, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        const text = await res.text()
        console.log("Direct API delete result:", { status: res.status, body: text })
        if (!res.ok) {
          return NextResponse.json({ error: `LiveKit error (${res.status}): ${text}` }, { status: 500 })
        }
        return NextResponse.json({ success: true })
      } catch (e2: any) {
        console.error("Direct API also failed:", e2.message || e2)
        return NextResponse.json({ error: `Erro ao encerrar: RoomServiceClient=${e1.message}, DirectAPI=${e2.message}` }, { status: 500 })
      }
    }
  } catch (error) {
    console.error("Delete room error:", error)
    return NextResponse.json({ error: "Erro ao encerrar sala" }, { status: 500 })
  }
}
