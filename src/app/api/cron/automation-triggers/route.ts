import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { fireTrigger } from "@/lib/automation-engine"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results = { birthdays: 0, taskOverdue: 0, weeklySummary: 0, errors: 0 }

  try {
    const psychologists = await prisma.user.findMany({
      where: { active: true, plan: { in: ["pro", "clinica", "trial"] } },
      select: { id: true, name: true, email: true },
    })

    const now = new Date()
    const todayMonth = now.getMonth() + 1
    const todayDay = now.getDate()

    for (const psych of psychologists) {
      try {
        // --- Birthday trigger ---
        const birthdayPatients = await prisma.patient.findMany({
          where: {
            psychologistId: psych.id,
            active: true,
            dateOfBirth: { not: null },
          },
          select: { id: true, name: true, email: true, dateOfBirth: true },
        })

        for (const patient of birthdayPatients) {
          if (!patient.dateOfBirth) continue
          const dob = new Date(patient.dateOfBirth)
          if (dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay) {
            await fireTrigger("birthday", {
              psychologistId: psych.id,
              patientId: patient.id,
              patientName: patient.name,
              patientEmail: patient.email ?? undefined,
            })
            results.birthdays++
          }
        }

        // --- Task overdue trigger ---
        const patientIds = birthdayPatients.map(p => p.id)
        if (patientIds.length > 0) {
          const overdueTasks = await prisma.therapyTask.findMany({
            where: {
              psychologistId: psych.id,
              patientId: { in: patientIds },
              status: "PENDING",
              assignedAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
            },
            select: { id: true, patientId: true, notes: true, patient: { select: { name: true, email: true } } },
          })

          for (const task of overdueTasks) {
            await fireTrigger("task_overdue", {
              psychologistId: psych.id,
              patientId: task.patientId,
              patientName: task.patient.name,
              patientEmail: task.patient.email ?? undefined,
              taskTitle: task.notes || "Tarefa sem título",
            })
            results.taskOverdue++
          }
        }

        // --- Weekly summary trigger ---
        await fireTrigger("weekly_summary", {
          psychologistId: psych.id,
          customData: {
            weekStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            weekEnd: now.toISOString(),
          },
        })
        results.weeklySummary++

      } catch (err) {
        logger.error(`Automation triggers failed for psychologist ${psych.id}`, { error: String(err) })
        results.errors++
      }
    }

    logger.info("Automation triggers cron completed", results)
    return NextResponse.json({ success: true, ...results })
  } catch (err) {
    logger.error("Automation triggers cron failed", { error: String(err) })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
