import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const beckQuestions = [
  { order: 1, text: "Tristeza" },
  { order: 2, text: "Pessimismo" },
  { order: 3, text: "Senso de fracasso" },
  { order: 4, text: "Insatisfação" },
  { order: 5, text: "Culpa" },
  { order: 6, text: "Punição" },
  { order: 7, text: "Autoestima" },
  { order: 8, text: "Autocrítica" },
  { order: 9, text: "Pensamentos suicidas" },
  { order: 10, text: "Choro" },
  { order: 11, text: "Irritabilidade" },
  { order: 12, text: "Interesse social" },
  { order: 13, text: "Indecisão" },
  { order: 14, text: "Imagem corporal" },
  { order: 15, text: "Capacidade de trabalhar" },
  { order: 16, text: "Sono" },
  { order: 17, text: "Fadiga" },
  { order: 18, text: "Apetite" },
  { order: 19, text: "Peso" },
  { order: 20, text: "Preocupação com a saúde" },
  { order: 21, text: "Libido" },
]

const pssQuestions = [
  { order: 1, text: "Com que frequência você ficou chateado por causa de algo que aconteceu inesperadamente?" },
  { order: 2, text: "Com que frequência você sentiu que não conseguia controlar as coisas importantes da sua vida?" },
  { order: 3, text: "Com que frequência você se sentiu nervoso ou estressado?" },
  { order: 4, text: "Com que frequência você sentiu confiança na sua capacidade de lidar com seus problemas pessoais?" },
  { order: 5, text: "Com que frequência você sentiu que as coisas estavam acontecendo do seu jeito?" },
  { order: 6, text: "Com que frequência você achou que não conseguiria lidar com todas as coisas que tinha que fazer?" },
  { order: 7, text: "Com que frequência você conseguiu controlar as irritações da sua vida?" },
  { order: 8, text: "Com que frequência você sentiu que estava no controle das coisas?" },
  { order: 9, text: "Com que frequência você ficou irritado porque as coisas estavam fora do seu controle?" },
  { order: 10, text: "Com que frequência você sentiu que as dificuldades estavam se acumulando tanto que você não conseguiria superá-las?" },
]

const miniQuestions = [
  { order: 1, text: "Você já se sentiu deprimido ou sem esperança na maior parte do tempo nas últimas duas semanas?" },
  { order: 2, text: "Você perdeu o interesse ou prazer em atividades que antes gostava?" },
  { order: 3, text: "Nas últimas duas semanas, você se sentiu extremamente irritado ou de mau humor?" },
  { order: 4, text: "Você já teve períodos em que se sentia tão eufórico ou cheio de energia que outros se preocupavam?" },
  { order: 5, text: "Você já sentiu medo intenso ou pânico em situações onde não havia perigo real?" },
  { order: 6, text: "Você tem se preocupado excessivamente com várias coisas diferentes na maioria dos dias?" },
  { order: 7, text: "Você já teve a sensação de que algo ruim estava prestes a acontecer?" },
  { order: 8, text: "Você já revivenciou um evento traumático repetidamente em pensamentos ou sonhos?" },
  { order: 9, text: "Você evita situações que lembram um evento traumático?" },
  { order: 10, text: "Você já bebeu mais do que pretendia ou teve dificuldade em parar de beber?" },
  { order: 11, text: "Você já usou drogas em situações perigosas (como dirigir)?" },
  { order: 12, text: "Você já sentiu que precisava reduzir o uso de álcool ou drogas?" },
  { order: 13, text: "Você já teve um período em que perdeu peso sem dieta, dormiu mal ou se sentiu agitado?" },
  { order: 14, text: "Você já teve pensamentos de que seria melhor estar morto?" },
  { order: 15, text: "Você já tentou se machucar de propósito?" },
  { order: 16, text: "Você sente que precisa de ajuda profissional agora?" },
]

const beckOptions = JSON.stringify([
  { value: 0, label: "Alternativa A" },
  { value: 1, label: "Alternativa B" },
  { value: 2, label: "Alternativa C" },
  { value: 3, label: "Alternativa D" },
])

const pssOptions = JSON.stringify([
  { value: 0, label: "Nunca" },
  { value: 1, label: "Quase nunca" },
  { value: 2, label: "Às vezes" },
  { value: 3, label: "Frequentemente" },
  { value: 4, label: "Sempre" },
])

const miniOptions = JSON.stringify([
  { value: 0, label: "Não" },
  { value: 1, label: "Sim" },
])

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get("secret") !== "ApvVr8FOWwhgkSEtfZ2uDJ1sRx73XmCl") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const firstPsych = await prisma.user.findFirst({ where: { role: "PSYCHOLOGIST" }, select: { id: true } })
  if (!firstPsych) {
    return NextResponse.json({ error: "Nenhum psicólogo encontrado no banco" }, { status: 400 })
  }
  const psychId = firstPsych.id

  const results: string[] = []

  const existingBeck = await prisma.questionnaire.findFirst({ where: { type: "BECK" } })
  if (!existingBeck) {
    await prisma.questionnaire.create({
      data: {
        type: "BECK",
        title: "Inventário de Depressão de Beck (BDI)",
        description: "Avaliação da intensidade dos sintomas depressivos. 21 itens, escala 0-3.",
        isActive: true,
        psychologistId: psychId,
        questions: {
          create: beckQuestions.map(q => ({
            questionText: q.text,
            questionOrder: q.order,
            options: beckOptions,
            scaleMin: 0,
            scaleMax: 3,
          })),
        },
      },
    })
    results.push("BECK criado")
  } else {
    results.push("BECK já existe")
  }

  const existingPss = await prisma.questionnaire.findFirst({ where: { type: "PSS" } })
  if (!existingPss) {
    await prisma.questionnaire.create({
      data: {
        type: "PSS",
        title: "Escala de Estresse Percebido (PSS-10)",
        description: "Avalia o nível de estresse percebido no último mês. 10 itens, escala 0-4.",
        isActive: true,
        psychologistId: psychId,
        questions: {
          create: pssQuestions.map(q => ({
            questionText: q.text,
            questionOrder: q.order,
            options: pssOptions,
            scaleMin: 0,
            scaleMax: 4,
          })),
        },
      },
    })
    results.push("PSS criado")
  } else {
    results.push("PSS já existe")
  }

  const existingMini = await prisma.questionnaire.findFirst({ where: { type: "MINI" } })
  if (!existingMini) {
    await prisma.questionnaire.create({
      data: {
        type: "MINI",
        title: "MINI - Rastreio Inicial",
        description: "Triagem rápida para transtornos mentais. Responda SIM ou NÃO.",
        isActive: true,
        psychologistId: psychId,
        questions: {
          create: miniQuestions.map(q => ({
            questionText: q.text,
            questionOrder: q.order,
            options: miniOptions,
            scaleMin: 0,
            scaleMax: 1,
          })),
        },
      },
    })
    results.push("MINI criado")
  } else {
    results.push("MINI já existe")
  }

  return NextResponse.json({ results })
}
