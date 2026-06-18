import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const phq9Questions = [
  { order: 1, text: "Pouco interesse ou prazer em fazer as coisas", category: "Depressão" },
  { order: 2, text: "Sentir-se triste, deprimido ou sem esperança", category: "Depressão" },
  { order: 3, text: "Dificuldade para dormir ou manter-se dormindo, ou dormir demais", category: "Depressão" },
  { order: 4, text: "Sentir-se cansado ou com pouca energia", category: "Depressão" },
  { order: 5, text: "Pouco apetite ou comer demais", category: "Depressão" },
  { order: 6, text: "Sentir-se mal sobre si mesmo", category: "Depressão" },
  { order: 7, text: "Dificuldade para se concentrar", category: "Depressão" },
  { order: 8, text: "Mover-se ou falar muito devagar", category: "Depressão" },
  { order: 9, text: "Pensamentos de que seria melhor estar morto", category: "Depressão" },
]

const gad7Questions = [
  { order: 1, text: "Sentir-se nervoso, ansioso ou tenso", category: "Ansiedade" },
  { order: 2, text: "Não conseguir parar ou controlar as preocupações", category: "Ansiedade" },
  { order: 3, text: "Preocupar-se excessivamente com coisas diferentes", category: "Ansiedade" },
  { order: 4, text: "Dificuldade para relaxar", category: "Ansiedade" },
  { order: 5, text: "Ficar tão inquieto que fica difícil ficar parado", category: "Ansiedade" },
  { order: 6, text: "Ficar facilmente irritado ou aborrecido", category: "Ansiedade" },
  { order: 7, text: "Sentir medo como se algo terrível fosse acontecer", category: "Ansiedade" },
]

const options = JSON.stringify([
  { value: 0, label: "Nenhum dia" },
  { value: 1, label: "Vários dias" },
  { value: 2, label: "Mais da metade dos dias" },
  { value: 3, label: "Quase todos os dias" },
])

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get("secret") !== "ApvVr8FOWwhgkSEtfZ2uDJ1sRx73XmCl") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const results: string[] = []

  const existingPhq9 = await prisma.questionnaire.findFirst({ where: { type: "PHQ9" } })
  if (!existingPhq9) {
    await prisma.questionnaire.create({
      data: {
        type: "PHQ9",
        title: "PHQ-9 — Questionário de Saúde do Paciente",
        description: "Triagem e monitoramento da gravidade da depressão.",
        isActive: true,
        psychologistId: "system",
        questions: { create: phq9Questions.map(q => ({ questionText: q.text, questionOrder: q.order, options, category: q.category })) },
      },
    })
    results.push("PHQ-9 criado")
  } else {
    results.push("PHQ-9 já existe")
  }

  const existingGad7 = await prisma.questionnaire.findFirst({ where: { type: "GAD7" } })
  if (!existingGad7) {
    await prisma.questionnaire.create({
      data: {
        type: "GAD7",
        title: "GAD-7 — Escala de Ansiedade Generalizada",
        description: "Triagem e monitoramento da gravidade da ansiedade.",
        isActive: true,
        psychologistId: "system",
        questions: { create: gad7Questions.map(q => ({ questionText: q.text, questionOrder: q.order, options, category: q.category })) },
      },
    })
    results.push("GAD-7 criado")
  } else {
    results.push("GAD-7 já existe")
  }

  return NextResponse.json({ results })
}