import { RoomServiceClient } from "livekit-server-sdk"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

function getLiveKitConfig() {
  const raw = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || ""
  const host = raw.replace("wss://", "https://").replace(/\/+$/, "")
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  return { host, apiKey: apiKey || "", apiSecret: apiSecret || "" }
}

export async function GET() {
  try {
    const psychologistId = await requireAuth()
    const closed = await prisma.closedRoom.findMany({
      where: { psychologistId },
      orderBy: { closedAt: "desc" },
      take: 10,
    })
    return apiSuccess({ closed })
  } catch (error) {
    console.error("GET closed rooms error:", error)
    return apiError("Erro ao buscar salas")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const { room } = await request.json()
    if (!room) {
      return apiError("Room name required", 400)
    }

    console.log("POST room", { room, userId: psychologistId })

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
    const record = await prisma.closedRoom.upsert({
      where: { roomName: room },
      update: {},
      create: {
        roomName: room,
        psychologistId,
      },
    })
    console.log("ClosedRoom created:", record)

    return apiSuccess({ success: true })
  } catch (error) {
    console.error("Delete room error:", error)
    return apiError("Erro ao encerrar sala")
  }
}
