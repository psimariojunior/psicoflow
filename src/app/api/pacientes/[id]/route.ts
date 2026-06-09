import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/security"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        psychologistId: (session.user as { id: string }).id,
      },
      include: {
        appointments: {
          orderBy: { startTime: "desc" },
          take: 10,
        },
        medicalRecords: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        therapySessions: {
          orderBy: { date: "desc" },
          take: 20,
        },
      },
    })

    if (!patient) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json(
      { error: "Erro ao buscar paciente" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const patient = await prisma.patient.update({
      where: {
        id: params.id,
        psychologistId: (session.user as { id: string }).id,
      },
      data,
    })

    await logAudit(
      (session.user as { id: string }).id,
      "UPDATE",
      "Patient",
      patient.id,
      `Paciente ${patient.name} atualizado`
    )

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error updating patient:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar paciente" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await prisma.patient.delete({
      where: {
        id: params.id,
        psychologistId: (session.user as { id: string }).id,
      },
    })

    await logAudit(
      (session.user as { id: string }).id,
      "DELETE",
      "Patient",
      params.id,
      "Paciente removido"
    )

    return NextResponse.json({ message: "Paciente removido com sucesso" })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return NextResponse.json(
      { error: "Erro ao remover paciente" },
      { status: 500 }
    )
  }
}
