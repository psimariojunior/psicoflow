import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPatientToken } from "@/lib/patient-auth"

export const dynamic = "force-dynamic"

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return verifyPatientToken(authHeader.slice(7))
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await authenticate(request)
    if (!payload) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id } = await params

    const task = await prisma.therapyTask.findUnique({ where: { id } })
    if (!task) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    if (task.patientId !== payload.patientId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

    const updated = await prisma.therapyTask.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}