import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const patient = await prisma.patient.findFirst({
      where: { id, psychologistId: session.user.id },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const anamnese = await prisma.anamnesis.findUnique({
      where: { patientId: id },
    })

    return NextResponse.json(anamnese || null)
  } catch (error) {
    console.error("Erro ao buscar anamnese:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}