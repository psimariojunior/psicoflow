import { NextResponse } from "next/server"
import { RoomServiceClient } from "livekit-server-sdk"
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

    const host = process.env.LIVEKIT_URL?.replace("wss://", "https://")
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    if (!host || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "LiveKit não configurado" }, { status: 500 })
    }

    const client = new RoomServiceClient(host, apiKey, apiSecret)
    await client.deleteRoom(room)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete room error:", error)
    return NextResponse.json({ error: "Erro ao encerrar sala" }, { status: 500 })
  }
}
