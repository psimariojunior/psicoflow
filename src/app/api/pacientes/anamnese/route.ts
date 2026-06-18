import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPatientToken } from "@/lib/patient-auth"

export const dynamic = "force-dynamic"

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return verifyPatientToken(authHeader.slice(7))
}

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request)
    if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const anamnese = await prisma.anamnesis.findUnique({
      where: { patientId: payload.patientId },
    })

    return NextResponse.json(anamnese || null)
  } catch (error) {
    console.error("Erro ao buscar anamnese:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request)
    if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const body = await request.json()

    const patient = await prisma.patient.findUnique({
      where: { id: payload.patientId },
      select: { psychologistId: true },
    })

    if (!patient) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })

    const data = {
      complaints: body.complaints,
      history: body.history,
      medications: body.medications,
      allergies: body.allergies,
      familyHistory: body.familyHistory,
      lifestyle: body.lifestyle,
      expectations: body.expectations,
      previousTherapy: body.previousTherapy,
      completed: true,
    }

    const anamnese = await prisma.anamnesis.upsert({
      where: { patientId: payload.patientId },
      update: data,
      create: { ...data, patientId: payload.patientId, psychologistId: patient.psychologistId },
    })

    return NextResponse.json(anamnese)
  } catch (error) {
    console.error("Erro ao salvar anamnese:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}