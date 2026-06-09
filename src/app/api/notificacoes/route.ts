import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { dispatchNotification } from "@/lib/notifications"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const psychologistId = (session.user as { id: string }).id

    const notifications = await prisma.notification.findMany({
      where: { psychologistId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const patientIds = notifications.map((n) => n.patientId).filter(Boolean) as string[]
    const patients = patientIds.length > 0
      ? await prisma.patient.findMany({ where: { id: { in: patientIds } }, select: { id: true, name: true } })
      : []
    const patientMap = Object.fromEntries(patients.map((p) => [p.id, p.name]))

    const enriched = notifications.map((n) => ({
      ...n,
      patientName: n.patientId ? patientMap[n.patientId] || null : null,
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Erro ao buscar notificações" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { title, message, channel, patientId, sendAt } = await request.json()

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        channel,
        patientId: patientId || null,
        recipientId: patientId || null,
        psychologistId: (session.user as { id: string }).id,
        status: "PENDING",
        scheduledAt: sendAt ? new Date(sendAt) : null,
        createdAt: new Date(),
      },
    })

    if (!sendAt) {
      dispatchNotification(notification.id, {
        psychologistName: (session.user as { name?: string }).name || "Psicólogo",
      }).catch((err) =>
        logger.error("Failed to dispatch immediate notification", { id: notification.id, error: String(err) })
      )
    }

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { error: "Erro ao criar notificação" },
      { status: 500 }
    )
  }
}
