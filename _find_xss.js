const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
  }
});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const results = {};

  const apps = await prisma.appointment.findMany({
    where: {
      OR: [
        { title: { contains: '<script>' } },
        { notes: { contains: '<script>' } },
        { cancelReason: { contains: '<script>' } },
      ]
    },
    select: { id: true, title: true, notes: true, cancelReason: true, startTime: true, patientId: true },
    orderBy: { startTime: 'desc' }
  });
  results.appointments = apps;

  const patients = await prisma.patient.findMany({
    where: { name: { contains: '<script>' } },
    select: { id: true, name: true, email: true }
  });
  results.patients = patients;

  const records = await prisma.medicalRecord.findMany({
    where: {
      OR: [
        { title: { contains: '<script>' } },
        { content: { contains: '<script>' } },
      ]
    },
    select: { id: true, title: true }
  });
  results.records = records;

  const diary = await prisma.emotionDiary.findMany({
    where: {
      OR: [
        { notes: { contains: '<script>' } },
        { emotions: { contains: '<script>' } },
        { activities: { contains: '<script>' } },
      ]
    },
    select: { id: true, notes: true }
  });
  results.diary = diary;

  const sessions = await prisma.therapySession.findMany({
    where: {
      OR: [
        { subjective: { contains: '<script>' } },
        { objective: { contains: '<script>' } },
        { assessment: { contains: '<script>' } },
        { plan: { contains: '<script>' } },
        { notes: { contains: '<script>' } },
      ]
    },
    select: { id: true, notes: true }
  });
  results.sessions = sessions;

  console.log(JSON.stringify(results, null, 2));
}

main().finally(() => prisma.$disconnect());
