import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AccessToken } from "livekit-server-sdk"
import { prisma } from "@/lib/prisma"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { apiError } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

const rateLimit = rateLimitMiddleware(10, 60000)

export async function GET(request: Request) {
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const room = searchParams.get("room")
    const isPatient = searchParams.get("patient") === "true"

    if (!room) {
      return apiError("Room name required", 400)
    }

    const closed = await prisma.closedRoom.findUnique({ where: { roomName: room } })
    if (closed) {
      return apiError("Esta sala foi encerrada e não está mais disponível.", 410)
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    if (!apiKey || !apiSecret) {
      return apiError("LiveKit não configurado")
    }

    let identity: string
    let name: string

    if (isPatient) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          status: { in: ["CONFIRMED", "SCHEDULED"] },
          endTime: { gte: new Date() },
        },
      })
      if (!appointment) {
        return apiError("Sala não disponível ou sessão não agendada", 403)
      }
      identity = `paciente-${room}-${Date.now()}`
      name = searchParams.get("name") || "Paciente"
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return apiError("Não autorizado", 401)
      }
      identity = session.user.id || session.user.email || "unknown"
      name = session.user.name || "Psicólogo"
    }

    const at = new AccessToken(apiKey, apiSecret, { identity, name })
    at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true })

    return NextResponse.json({ token: await at.toJwt() })
  } catch (error) {
    console.error("LiveKit token error:", error)
    return NextResponse.json({ error: "Erro ao gerar token" }, { status: 500 })
  }
}
