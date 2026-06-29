import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const automationSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  triggerType: z.enum([
    "appointment_booked",
    "appointment_cancelled",
    "session_completed",
    "task_overdue",
    "new_patient",
    "birthday",
    "no_show",
    "weekly_summary",
  ]),
  actionType: z.enum([
    "send_email",
    "send_whatsapp",
    "create_task",
    "notify_psychologist",
    "send_reminder",
    "update_status",
  ]),
  actionConfig: z.record(z.unknown()),
  enabled: z.boolean().default(true),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const automations = await prisma.automation.findMany({
    where: { psychologistId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ automations })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await request.json()
  const parsed = automationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const automation = await prisma.automation.create({
    data: {
      psychologistId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      triggerType: parsed.data.triggerType,
      actionType: parsed.data.actionType,
      actionConfig: JSON.stringify(parsed.data.actionConfig),
      enabled: parsed.data.enabled,
    },
  })

  return NextResponse.json({ automation }, { status: 201 })
}
