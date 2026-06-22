import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get("patientId")

    if (!patientId) {
      return NextResponse.json({ error: "patientId obrigatório" }, { status: 400 })
    }

    // Verify the patient belongs to this psychologist
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, psychologistId: session.user.id },
    })
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const anamnese = await prisma.anamnesis.findUnique({
      where: { patientId },
      include: {
        psychologist: {
          select: { id: true, name: true, crp: true },
        },
      },
    })

    if (!anamnese) {
      return NextResponse.json(null)
    }

    return NextResponse.json(anamnese)
  } catch (error) {
    console.error("Erro ao buscar anamnese:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { patientId, complaints, history, medications, allergies, familyHistory, lifestyle, expectations, previousTherapy } = body

    if (!patientId) {
      return NextResponse.json({ error: "patientId obrigatório" }, { status: 400 })
    }

    // Verify the patient belongs to this psychologist
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, psychologistId: session.user.id },
    })
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const anamnese = await prisma.anamnesis.upsert({
      where: { patientId },
      update: {
        complaints,
        history,
        medications,
        allergies,
        familyHistory,
        lifestyle,
        expectations,
        previousTherapy,
        completed: true,
      },
      create: {
        patientId,
        psychologistId: session.user.id,
        complaints,
        history,
        medications,
        allergies,
        familyHistory,
        lifestyle,
        expectations,
        previousTherapy,
        completed: true,
      },
    })

    return NextResponse.json(anamnese)
  } catch (error) {
    console.error("Erro ao salvar anamnese:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}