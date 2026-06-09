import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

    const host = process.env.NEXT_PUBLIC_LIVEKIT_URL?.replace("wss://", "https://")
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    if (!host || !apiKey || !apiSecret) {
      console.error("Missing LiveKit env vars", { host: !!host, key: !!apiKey, secret: !!apiSecret })
      return NextResponse.json({ error: "LiveKit não configurado" }, { status: 500 })
    }

    const at = new AccessToken(apiKey, apiSecret, { ttl: "5m" })
    at.addGrant({ roomCreate: false, roomAdmin: true, room: room })
    const token = await at.toJwt()

    const url = `${host}/api/v1/rooms/${encodeURIComponent(room)}`
    console.log("Deleting room via", url)

    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("LiveKit API error:", res.status, text)
      return NextResponse.json({ error: `Erro ao encerrar: ${res.status} ${text}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete room error:", error)
    return NextResponse.json({ error: "Erro ao encerrar sala" }, { status: 500 })
  }
}
