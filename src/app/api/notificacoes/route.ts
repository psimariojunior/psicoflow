import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendReminderNow } from "@/lib/notifications"

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

    const { title, message, channel, patientId, appointmentDate, appointmentTime, patientEmail, patientPhone, patientName } = await request.json()
    const psychologistId = (session.user as { id: string }).id
    const psychologistName = (session.user as { name?: string }).name || "Psicólogo"

    console.log("[POST /api/notificacoes] request", { title, channel, patientId, appointmentDate, appointmentTime, patientEmail, patientPhone, patientName, psychologistName })

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        channel,
        patientId: patientId || null,
        recipientId: patientId || null,
        psychologistId,
        status: "PENDING",
      },
    })

    const result = await sendReminderNow(patientId, channel, psychologistName, appointmentDate || "", appointmentTime || "", {
      email: patientEmail,
      phone: patientPhone,
      name: patientName,
    })

    const errorMessage = result.ok ? null : (result.error || "Falha no envio")

    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: result.ok ? "SENT" : "FAILED",
        sentAt: result.ok ? new Date() : null,
        errorMessage,
      },
    })

    if (!result.ok) {
      console.error("[POST /api/notificacoes] send failed", { channel, patientId, error: result.error })
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    return NextResponse.json({ ...notification, status: "SENT" }, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { error: "Erro ao criar notificação" },
      { status: 500 }
    )
  }
}
