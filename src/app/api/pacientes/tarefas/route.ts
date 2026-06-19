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

    const tasks = await prisma.therapyTask.findMany({
      where: { patientId: payload.patientId },
      include: {
        resource: { select: { id: true, name: true, description: true, type: true, content: true } },
      },
      orderBy: { assignedAt: "desc" },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}