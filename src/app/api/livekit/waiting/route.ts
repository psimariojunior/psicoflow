import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

// In-memory waiting room store (transient — resets on cold start, fine for real-time waiting)
interface WaitingPatient {
  id: string
  room: string
  name: string
  status: "waiting" | "approved" | "rejected"
  createdAt: number
}

const waitingRoom = new Map<string, WaitingPatient>()

// Auto-cleanup entries older than 10 minutes
function cleanup() {
  const now = Date.now()
  const entries = Array.from(waitingRoom.entries())
  for (const [key, entry] of entries) {
    if (now - entry.createdAt > 10 * 60 * 1000) {
      waitingRoom.delete(key)
    }
  }
}

// GET /api/livekit/waiting — no room param → all waiting (dashboard badge/queue)
// GET /api/livekit/waiting?room=XXX — psychologist gets waiting patients for room
// GET /api/livekit/waiting?room=XXX&id=YYY — patient checks status
export async function GET(request: Request) {
  cleanup()
  const { searchParams } = new URL(request.url)
  const room = searchParams.get("room")
  const patientId = searchParams.get("id")

  // Patient checking their own status
  if (patientId) {
    const entry = waitingRoom.get(patientId)
    if (!entry) {
      return NextResponse.json({ status: "not_found" })
    }
    return NextResponse.json({ status: entry.status, id: entry.id })
  }

  // No room specified → return ALL waiting patients (for dashboard badge/queue)
  if (!room) {
    const patients = Array.from(waitingRoom.values())
    return NextResponse.json({ patients })
  }

  // Room specified → return patients for that room (for sala-virtual polling)
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const patients: WaitingPatient[] = []
    const entries = Array.from(waitingRoom.values())
    for (const entry of entries) {
      if (entry.room === room) {
        patients.push(entry)
      }
    }

    return NextResponse.json({ patients })
  } catch {
    return NextResponse.json({ patients: [] })
  }
}

// POST /api/livekit/waiting — patient registers as waiting
export async function POST(request: Request) {
  cleanup()
  try {
    const body = await request.json()
    const { room, name } = body

    if (!room || !name) {
      return NextResponse.json({ error: "Room and name required" }, { status: 400 })
    }

    const id = `wait-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const entry: WaitingPatient = {
      id,
      room,
      name,
      status: "waiting",
      createdAt: Date.now(),
    }

    waitingRoom.set(id, entry)
    logger.info("Patient joined waiting room", { room, name, id })

    return NextResponse.json({ id, status: "waiting" }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro ao entrar na sala de espera" }, { status: 500 })
  }
}

// PUT /api/livekit/waiting — psychologist approves/rejects
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { id, action } = body

    if (!id || !["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 })
    }

    const entry = waitingRoom.get(id)
    if (!entry) {
      return NextResponse.json({ error: "Patient not found in waiting room" }, { status: 404 })
    }

    entry.status = action
    waitingRoom.set(id, entry)

    logger.info("Waiting room decision", { id, action, room: entry.room, name: entry.name })

    return NextResponse.json({ ok: true, status: action })
  } catch {
    return NextResponse.json({ error: "Erro ao processar" }, { status: 500 })
  }
}

// DELETE /api/livekit/waiting — remove from waiting room
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (id) {
      waitingRoom.delete(id)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
