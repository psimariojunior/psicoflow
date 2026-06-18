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

    const accesses = await prisma.crisisProtocolAccess.findMany({
      where: {
        patientId: session.user.id,
        isActive: true,
        protocol: { isActive: true },
      },
      include: {
        protocol: {
          select: {
            id: true,
            title: true,
            description: true,
            content: true,
            category: true,
            tags: true,
            createdAt: true,
          },
        },
      },
      orderBy: { grantedAt: "desc" },
    })

    return NextResponse.json(accesses.map(a => a.protocol))
  } catch (error) {
    console.error("Erro ao buscar protocolos do paciente:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}