import { prisma } from "./prisma"
import { sendEmail } from "./email"
import { logger } from "./logger"

export type TriggerType =
  | "appointment_booked"
  | "appointment_cancelled"
  | "session_completed"
  | "task_overdue"
  | "new_patient"
  | "birthday"
  | "no_show"
  | "weekly_summary"

export type ActionType =
  | "send_email"
  | "send_whatsapp"
  | "create_task"
  | "notify_psychologist"
  | "send_reminder"
  | "update_status"

interface TriggerContext {
  psychologistId: string
  patientId?: string
  patientName?: string
  patientEmail?: string
  appointmentId?: string
  appointmentDate?: string
  appointmentTime?: string
  taskTitle?: string
  customData?: Record<string, unknown>
}

export async function fireTrigger(
  triggerType: TriggerType,
  context: TriggerContext
) {
  try {
    const automations = await prisma.automation.findMany({
      where: {
        psychologistId: context.psychologistId,
        triggerType,
        enabled: true,
      },
    })

    if (automations.length === 0) return

    const psychologist = await prisma.user.findUnique({
      where: { id: context.psychologistId },
      select: { name: true, email: true },
    })

    for (const automation of automations) {
      try {
        const config = JSON.parse(automation.actionConfig as string)
        await executeAction(automation.actionType as ActionType, config, {
          ...context,
          psychologistName: psychologist?.name,
          psychologistEmail: psychologist?.email,
          automationName: automation.name,
        })

        await prisma.automation.update({
          where: { id: automation.id },
          data: { lastRunAt: new Date(), runCount: { increment: 1 } },
        })

        await prisma.automationLog.create({
          data: {
            triggerType,
            actionType: automation.actionType,
            status: "SUCCESS",
            context: {
              patientName: context.patientName,
              patientEmail: context.patientEmail,
              appointmentDate: context.appointmentDate,
              automationName: automation.name,
            },
            automationId: automation.id,
            psychologistId: context.psychologistId,
          },
        })
      } catch (err) {
        logger.error(`Automation ${automation.id} action failed`, { error: String(err) })

        await prisma.automationLog.create({
          data: {
            triggerType,
            actionType: automation.actionType,
            status: "FAILED",
            error: String(err),
            context: {
              patientName: context.patientName,
              patientEmail: context.patientEmail,
              automationName: automation.name,
            },
            automationId: automation.id,
            psychologistId: context.psychologistId,
          },
        })
      }
    }
  } catch (err) {
    logger.error("fireTrigger failed", { error: String(err) })
  }
}

async function executeAction(
  actionType: ActionType,
  config: Record<string, unknown>,
  context: TriggerContext & { psychologistName?: string; psychologistEmail?: string; automationName?: string }
) {
  switch (actionType) {
    case "send_email": {
      const to = (config.to as string) === "patient" ? context.patientEmail : context.psychologistEmail
      const subject = replaceVars((config.subject as string) || "Notificação PsiHumanis", context)
      const body = replaceVars((config.body as string) || "", context)
      if (to) {
        await sendEmail(to, subject, `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">${body}</div>`)
      }
      break
    }
    case "notify_psychologist": {
      if (context.psychologistEmail) {
        const message = replaceVars((config.message as string) || "Automação disparada", context)
        await sendEmail(context.psychologistEmail, `PsiHumanis — ${context.automationName || "Automação"}`, `<div style="font-family:Arial,sans-serif;padding:20px;">${message}</div>`)
      }
      break
    }
    case "send_reminder": {
      const patientEmail = context.patientEmail
      if (patientEmail && context.appointmentDate) {
        await sendEmail(patientEmail, "Lembrete de consulta — PsiHumanis", `<div style="font-family:Arial,sans-serif;padding:20px;"><p>Olá, ${context.patientName || "Paciente"},</p><p>Este é um lembrete da sua consulta agendada para <strong>${context.appointmentDate} às ${context.appointmentTime || ""}</strong>.</p><p>Se precisar remarcar ou cancelar, acesse sua agenda no PsiHumanis.</p></div>`)
      }
      break
    }
    case "create_task": {
      if (context.patientId && context.psychologistId) {
        const resource = await prisma.therapyResource.findFirst({
          where: { psychologistId: context.psychologistId },
        })
        if (resource) {
          await prisma.therapyTask.create({
            data: {
              patientId: context.patientId,
              psychologistId: context.psychologistId,
              resourceId: resource.id,
              status: "PENDING",
              notes: replaceVars((config.taskTitle as string) || "Tarefa automática", context),
            },
          })
        }
      }
      break
    }
    case "update_status": {
      if (context.appointmentId) {
        const newStatus = (config.newStatus as string) || "CONFIRMED"
        await prisma.appointment.update({
          where: { id: context.appointmentId },
          data: { status: newStatus as never },
        })
      }
      break
    }
    default:
      break
  }
}

function replaceVars(template: string, context: TriggerContext & { psychologistName?: string }): string {
  return template
    .replace(/\{\{patient_name\}\}/g, context.patientName || "Paciente")
    .replace(/\{\{patient_email\}\}/g, context.patientEmail || "")
    .replace(/\{\{appointment_date\}\}/g, context.appointmentDate || "")
    .replace(/\{\{appointment_time\}\}/g, context.appointmentTime || "")
    .replace(/\{\{psychologist_name\}\}/g, context.psychologistName || "Psicólogo")
    .replace(/\{\{task_title\}\}/g, context.taskTitle || "")
}
