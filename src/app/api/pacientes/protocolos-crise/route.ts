import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPatientToken } from "@/lib/patient-auth"

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return verifyPatientToken(authHeader.slice(7))
}

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request)
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const accesses = await prisma.crisisProtocolAccess.findMany({
      where: {
        patientId: payload.patientId,
        isActive: true,
        protocol: { isActive: true },
      },
      include: {
        protocol: {
          select: {
            id: true, title: true, description: true, content: true,
            category: true, tags: true, createdAt: true,
          },
        },
      },
      orderBy: { grantedAt: "desc" },
    })

    return NextResponse.json(accesses.map(a => a.protocol))
  } catch (error) {
    console.error("Erro ao buscar protocolos:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}