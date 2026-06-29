import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const automation = await prisma.automation.findFirst({
    where: { id: params.id, psychologistId: session.user.id },
  })
  if (!automation) {
    return NextResponse.json({ error: "Automação não encontrada" }, { status: 404 })
  }

  const body = await request.json()

  const updated = await prisma.automation.update({
    where: { id: params.id },
    data: {
      name: body.name ?? automation.name,
      description: body.description ?? automation.description,
      enabled: body.enabled ?? automation.enabled,
      actionConfig: body.actionConfig ? JSON.stringify(body.actionConfig) : automation.actionConfig,
    },
  })

  return NextResponse.json({ automation: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const automation = await prisma.automation.findFirst({
    where: { id: params.id, psychologistId: session.user.id },
  })
  if (!automation) {
    return NextResponse.json({ error: "Automação não encontrada" }, { status: 404 })
  }

  await prisma.automation.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
