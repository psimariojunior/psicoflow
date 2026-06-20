import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const CRON_SECRET = process.env.CRON_SECRET || ""

function isAuthorized(request: Request): boolean {
  const url = new URL(request.url)
  const secret = url.searchParams.get("secret") || request.headers.get("x-cron-secret") || ""
  return secret === CRON_SECRET
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const [
      patientsCount,
      appointmentsCount,
      usersCount,
      questionnairesCount,
      questionnaireResponsesCount,
      therapySessionsCount,
      invoicesCount,
      notificationsCount,
      closedRoomsCount,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.user.count(),
      prisma.questionnaire.count(),
      prisma.questionnaireResponse.count(),
      prisma.therapySession.count(),
      prisma.invoice.count(),
      prisma.notification.count(),
      prisma.closedRoom.count(),
    ])

    const summary = JSON.stringify({
      patients: patientsCount,
      appointments: appointmentsCount,
      users: usersCount,
      questionnaires: questionnairesCount,
      questionnaireResponses: questionnaireResponsesCount,
      therapySessions: therapySessionsCount,
      invoices: invoicesCount,
      notifications: notificationsCount,
      closedRooms: closedRoomsCount,
      backedUpAt: new Date().toISOString(),
    })

    await prisma.backupLog.create({
      data: {
        type: "AUTO",
        status: "SUCCESS",
        summary,
      },
    })

    return NextResponse.json({ ok: true, summary: JSON.parse(summary) })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    await prisma.backupLog.create({
      data: {
        type: "AUTO",
        status: "FAILED",
        summary: errorMessage,
      },
    })

    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
