import { NextResponse } from "next/server"
import { RoomServiceClient } from "livekit-server-sdk"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function getLiveKitConfig() {
  const raw = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || ""
  const host = raw.replace("wss://", "https://").replace(/\/+$/, "")
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  return { host, apiKey: apiKey || "", apiSecret: apiSecret || "" }
}

export async function GET() {
  const closed = await prisma.closedRoom.findMany({ orderBy: { closedAt: "desc" }, take: 10 })
  return NextResponse.json({ closed })
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

    // Try to delete the room from LiveKit (best effort)
    if (host && apiKey && apiSecret) {
      try {
        const client = new RoomServiceClient(host, apiKey, apiSecret)
        await client.deleteRoom(room)
      } catch {
        // Room might not exist on LiveKit, that's OK
      }
    }

    // Mark as closed in the database
    await prisma.closedRoom.upsert({
      where: { roomName: room },
      update: {},
      create: {
        roomName: room,
        psychologistId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete room error:", error)
    return NextResponse.json({ error: "Erro ao encerrar sala" }, { status: 500 })
  }
}
