import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const anamnese = await prisma.anamnesis.findUnique({
      where: { patientId: session.user.id },
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
    const { complaints, history, medications, allergies, familyHistory, lifestyle, expectations, previousTherapy } = body

    const patient = await prisma.patient.findUnique({
      where: { id: session.user.id },
      select: { psychologistId: true },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const anamnese = await prisma.anamnesis.upsert({
      where: { patientId: session.user.id },
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
        patientId: session.user.id,
        psychologistId: patient.psychologistId,
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