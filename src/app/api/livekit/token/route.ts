import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AccessToken } from "livekit-server-sdk"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const room = searchParams.get("room")
    const isPatient = searchParams.get("patient") === "true"

    if (!room) {
      return NextResponse.json({ error: "Room name required" }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "LiveKit não configurado" }, { status: 500 })
    }

    let identity: string
    let name: string

    if (isPatient) {
      identity = `paciente-${room}-${Date.now()}`
      name = "Paciente"
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
      }
      identity = (session.user as any).id || session.user.email || "unknown"
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
