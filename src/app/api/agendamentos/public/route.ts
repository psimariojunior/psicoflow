import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { scheduleReminders } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, email, phone, startTime, psychologistId } = data

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }
    if (!startTime) {
      return NextResponse.json({ error: "Data/hora é obrigatória" }, { status: 400 })
    }

    const startDate = new Date(startTime)
    if (isNaN(startDate.getTime()) || startDate < new Date()) {
      return NextResponse.json({ error: "Data/hora inválida" }, { status: 400 })
    }

    let psychologistIdFinal = psychologistId
    if (!psychologistIdFinal) {
      const firstPsych = await prisma.user.findFirst({
        where: { role: "PSYCHOLOGIST", active: true },
        orderBy: { createdAt: "asc" },
      })
      if (!firstPsych) {
        return NextResponse.json({ error: "Nenhum psicólogo disponível" }, { status: 404 })
      }
      psychologistIdFinal = firstPsych.id
    }

    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + 40)

    const conflict = await prisma.appointment.findFirst({
      where: {
        psychologistId: psychologistIdFinal,
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        startTime: { lt: endDate },
        endTime: { gt: startDate },
      },
    })

    if (conflict) {
      return NextResponse.json({ error: "Este horário não está mais disponível" }, { status: 409 })
    }

    let patient = null
    if (email?.trim()) {
      patient = await prisma.patient.findFirst({
        where: { email: email.trim(), psychologistId: psychologistIdFinal },
      })
    }

    if (!patient && phone?.trim()) {
      patient = await prisma.patient.findFirst({
        where: { phone: phone.trim(), psychologistId: psychologistIdFinal },
      })
    }

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          name: name.trim(),
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          psychologistId: psychologistIdFinal,
        },
      })
    }

    const appointment = await prisma.appointment.create({
      data: {
        title: `Consulta - ${patient.name}`,
        startTime: startDate,
        endTime: endDate,
        status: "SCHEDULED",
        modality: "online",
        patientId: patient.id,
        psychologistId: psychologistIdFinal,
      },
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    })

    scheduleReminders(appointment.id, patient.id, psychologistIdFinal, startDate).catch(
      (e) => logger.error("scheduleReminders failed", { error: String(e) })
    )

    return NextResponse.json(
      {
        success: true,
        appointment: {
          id: appointment.id,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          patient: appointment.patient,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error("Error creating public appointment", { error: String(error) })
    return NextResponse.json({ error: "Erro ao agendar consulta" }, { status: 500 })
  }
}
