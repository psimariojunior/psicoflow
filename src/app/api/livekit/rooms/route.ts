import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const host = (process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || "")?.replace("wss://", "https://").replace(/\/+$/, "")
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  if (!host || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "LiveKit não configurado", host: !!host, key: !!apiKey, secret: !!apiSecret }, { status: 500 })
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, { ttl: "5m" })
    at.addGrant({ roomAdmin: true, roomCreate: true })
    const token = await at.toJwt()
    const res = await fetch(`${host}/api/v1/rooms`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 })
    const rooms = await res.json()
    return NextResponse.json({ rooms })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
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

    const host = (process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || "")?.replace("wss://", "https://").replace(/\/+$/, "")
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    if (!host || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "LiveKit não configurado" }, { status: 500 })
    }

    return await deleteRoomViaAPI(host, apiKey, apiSecret, room)
  } catch (error) {
    console.error("Delete room error:", error)
    return NextResponse.json({ error: "Erro ao encerrar sala" }, { status: 500 })
  }
}

async function deleteRoomViaAPI(host: string, apiKey: string, apiSecret: string, room: string) {
  const at = new AccessToken(apiKey, apiSecret, { ttl: "5m" })
  at.addGrant({ roomAdmin: true, room })
  const token = await at.toJwt()

  const url = `${host}/api/v1/rooms/${encodeURIComponent(room)}`
  console.log("Deleting room:", { host, room, url })

  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("LiveKit API error:", res.status, text)
    return NextResponse.json({ error: `Erro ao encerrar (${res.status}): ${text}` }, { status: 500 })
  }

  console.log("Room deleted successfully:", room)
  return NextResponse.json({ success: true })
}
