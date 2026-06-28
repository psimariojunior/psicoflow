import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import {
  registerPatient,
  approvePatient,
  rejectPatient,
  removePatient,
  getPatient,
  getAllPatients,
  getPatientsByRoom,
} from "@/lib/waiting-room-store"

export const dynamic = "force-dynamic"

// GET /api/livekit/waiting — no room → all patients (dashboard badge/queue)
// GET /api/livekit/waiting?room=X — psychologist gets patients for room
// GET /api/livekit/waiting?room=X&id=Y — patient checks status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const room = searchParams.get("room")
  const patientId = searchParams.get("id")

  // Patient checking their own status
  if (patientId) {
    const entry = getPatient(patientId)
    if (!entry) {
      return NextResponse.json({ status: "not_found" })
    }
    return NextResponse.json({ status: entry.status, id: entry.id })
  }

  // No room specified → return ALL patients (for dashboard badge/queue)
  if (!room) {
    const patients = getAllPatients()
    return NextResponse.json({ patients })
  }

  // Room specified → return patients for that room
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const patients = getPatientsByRoom(room)
    return NextResponse.json({ patients })
  } catch {
    return NextResponse.json({ patients: [] })
  }
}

// POST /api/livekit/waiting — register patient (called by token API automatically)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { room, name, status } = body

    if (!room || !name) {
      return NextResponse.json({ error: "Room and name required" }, { status: 400 })
    }

    const entry = registerPatient(room, name, status || "approved")
    logger.info("Patient registered in waiting room", { room, name, id: entry.id, status: entry.status })

    return NextResponse.json({ id: entry.id, status: entry.status }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro ao entrar na sala de espera" }, { status: 500 })
  }
}

// PUT /api/livekit/waiting — approve/reject (kept for backward compatibility)
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

    const success = action === "approved" ? approvePatient(id) : rejectPatient(id)
    if (!success) {
      return NextResponse.json({ error: "Patient not found in waiting room" }, { status: 404 })
    }

    logger.info("Waiting room decision", { id, action })
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
      removePatient(id)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
