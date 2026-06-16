import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendTextMessage, sendAppointmentReminderWhatsApp } from "@/lib/whatsapp"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const sendSchema = z.object({
  patientId: z.string().optional(),
  phone: z.string().min(10),
  message: z.string().min(1).max(4096),
  type: z.enum(["text", "reminder"]).default("text"),
  patientName: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const json = await req.json()
    const body = sendSchema.parse(json)

    let phone = body.phone
    let result: { ok: boolean; messageId?: string; error?: string }

    if (body.type === "reminder" && body.patientName && body.date && body.time) {
      const ok = await sendAppointmentReminderWhatsApp(phone, body.patientName, body.date, body.time)
      result = { ok, error: ok ? undefined : "Falha ao enviar lembrete" }
    } else {
      result = await sendTextMessage(phone, body.message)
    }

    if (body.patientId) {
      await prisma.notification.create({
        data: {
          title: body.type === "reminder" ? "Lembrete de consulta" : "Mensagem WhatsApp",
          message: body.message,
          channel: "WHATSAPP",
          status: result.ok ? "SENT" : "FAILED",
          patientId: body.patientId,
          recipientId: body.patientId,
          psychologistId: session.user.id,
          sentAt: result.ok ? new Date() : null,
          errorMessage: result.error,
        },
      })
    }

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
