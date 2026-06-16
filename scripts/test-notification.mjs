import { PrismaClient } from '@prisma/client'
import { scheduleReminders, processPendingNotifications } from '../src/lib/notifications.mjs'

const prisma = new PrismaClient()

async function main() {
  const psychologist = await prisma.user.findFirst()
  if (!psychologist) { console.log('ERROR: No psychologist found'); return }
  console.log('Psychologist:', psychologist.id)

  let patient = await prisma.patient.findFirst({ where: { phone: '5531992863861' } })
  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        name: 'Mario Teste',
        email: 'psi_mariojunior@hotmail.com',
        phone: '5531992863861',
        psychologistId: psychologist.id,
      }
    })
    console.log('Patient created:', patient.id)
  } else {
    console.log('Patient exists:', patient.id)
  }

  const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000)
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
  
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      psychologistId: psychologist.id,
      startTime,
      endTime,
      status: 'CONFIRMED',
    }
  })
  console.log('Appointment created:', appointment.id)

  await scheduleReminders(appointment.id, patient.id, psychologist.id, startTime, patient.name, patient.email || '', patient.phone || '')
  console.log('Reminders scheduled')

  const result = await processPendingNotifications({ force: true })
  console.log('Result:', JSON.stringify(result))
}

main().catch((e) => console.error('Error:', e)).finally(() => prisma.$disconnect())
