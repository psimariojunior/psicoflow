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

    const protocols = await prisma.crisisProtocol.findMany({
      where: {
        psychologistId: session.user.id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(protocols)
  } catch (error) {
    console.error("Erro ao buscar protocolos:", error)
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
    const { title, description, content, category, tags, patientIds } = body

    const protocol = await prisma.crisisProtocol.create({
      data: {
        title,
        description,
        content,
        category,
        tags,
        psychologistId: session.user.id,
        assignedTo: patientIds
          ? {
              create: patientIds.map((pid: string) => ({
                patientId: pid,
                psychologistId: session.user.id,
              })),
            }
          : undefined,
      },
      include: { assignedTo: true },
    })

    return NextResponse.json(protocol, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar protocolo:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}