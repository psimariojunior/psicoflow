import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const beckQuestions = [
  { order: 1, text: "Tristeza", options: [{ value: 0, label: "Não me sinto triste" }, { value: 1, label: "Eu me sinto triste" }, { value: 2, label: "Estou sempre triste e não consigo sair disso" }, { value: 3, label: "Estou tão triste que não consigo suportar" }] },
  { order: 2, text: "Pessimismo", options: [{ value: 0, label: "Não estou desanimado em relação ao futuro" }, { value: 1, label: "Eu me sinto mais desanimado do que antes" }, { value: 2, label: "Não espero que as coisas melhorem" }, { value: 3, label: "Sinto que o futuro é sem esperança" }] },
  { order: 3, text: "Senso de fracasso", options: [{ value: 0, label: "Não me sinto um fracasso" }, { value: 1, label: "Sinto que tive mais fracassos que outras pessoas" }, { value: 2, label: "Quando olho para trás, vejo muitos fracassos" }, { value: 3, label: "Sinto que sou um fracasso completo" }] },
  { order: 4, text: "Insatisfação", options: [{ value: 0, label: "Tenho prazer nas coisas como antes" }, { value: 1, label: "Não sinto prazer nas coisas como antes" }, { value: 2, label: "Não tenho mais prazer em nada" }, { value: 3, label: "Estou entediado com tudo" }] },
  { order: 5, text: "Culpa", options: [{ value: 0, label: "Não me sinto especialmente culpado" }, { value: 1, label: "Eu me sinto culpado muitas vezes" }, { value: 2, label: "Eu me sinto culpado na maior parte do tempo" }, { value: 3, label: "Eu me sinto culpado o tempo todo" }] },
  { order: 6, text: "Punição", options: [{ value: 0, label: "Não sinto que estou sendo punido" }, { value: 1, label: "Sinto que posso ser punido" }, { value: 2, label: "Espero ser punido" }, { value: 3, label: "Sinto que estou sendo punido" }] },
  { order: 7, text: "Autoestima", options: [{ value: 0, label: "Sinto o mesmo sobre mim que antes" }, { value: 1, label: "Perdi a confiança em mim mesmo" }, { value: 2, label: "Estou decepcionado comigo mesmo" }, { value: 3, label: "Não gosto de mim" }] },
  { order: 8, text: "Autocrítica", options: [{ value: 0, label: "Não me critico mais que o normal" }, { value: 1, label: "Sou mais crítico comigo do que antes" }, { value: 2, label: "Eu me critico por todos os meus erros" }, { value: 3, label: "Eu me culpo por tudo de ruim que acontece" }] },
  { order: 9, text: "Pensamentos suicidas", options: [{ value: 0, label: "Não tenho pensamentos de me matar" }, { value: 1, label: "Tenho pensamentos de me matar, mas não os levaria adiante" }, { value: 2, label: "Gostaria de me matar" }, { value: 3, label: "Eu me mataria se tivesse oportunidade" }] },
  { order: 10, text: "Choro", options: [{ value: 0, label: "Não choro mais que o normal" }, { value: 1, label: "Choro mais agora do que antes" }, { value: 2, label: "Choro por qualquer coisa" }, { value: 3, label: "Queria chorar mas não consigo" }] },
  { order: 11, text: "Irritabilidade", options: [{ value: 0, label: "Não estou mais irritado que o normal" }, { value: 1, label: "Estou mais irritado que o normal" }, { value: 2, label: "Estou irritado o tempo todo" }, { value: 3, label: "Não consigo mais me irritar com as coisas" }] },
  { order: 12, text: "Interesse social", options: [{ value: 0, label: "Tenho interesse nas outras pessoas" }, { value: 1, label: "Estou menos interessado nas pessoas" }, { value: 2, label: "Perdi a maior parte do interesse" }, { value: 3, label: "Perdi todo o interesse pelas pessoas" }] },
  { order: 13, text: "Indecisão", options: [{ value: 0, label: "Tomo decisões como antes" }, { value: 1, label: "Tenho mais dificuldade em decidir" }, { value: 2, label: "Tenho muita dificuldade em decidir" }, { value: 3, label: "Não consigo mais tomar decisões" }] },
  { order: 14, text: "Imagem corporal", options: [{ value: 0, label: "Acho minha aparência como antes" }, { value: 1, label: "Estou preocupado por estar parecendo mais velho" }, { value: 2, label: "Sinto que minha aparência mudou para pior" }, { value: 3, label: "Acho que estou feio" }] },
  { order: 15, text: "Capacidade de trabalhar", options: [{ value: 0, label: "Trabalho tão bem quanto antes" }, { value: 1, label: "Preciso de esforço extra para começar algo" }, { value: 2, label: "Não trabalho tão bem quanto antes" }, { value: 3, label: "Não consigo mais trabalhar" }] },
  { order: 16, text: "Sono", options: [{ value: 0, label: "Durmo tão bem quanto antes" }, { value: 1, label: "Não durmo tão bem quanto antes" }, { value: 2, label: "Acordo 1-2 horas mais cedo e não consigo voltar a dormir" }, { value: 3, label: "Acordo várias horas mais cedo e não consigo dormir" }] },
  { order: 17, text: "Fadiga", options: [{ value: 0, label: "Não fico mais cansado que o normal" }, { value: 1, label: "Fico cansado mais facilmente" }, { value: 2, label: "Fico cansado por qualquer coisa" }, { value: 3, label: "Estou cansado demais para fazer qualquer coisa" }] },
  { order: 18, text: "Apetite", options: [{ value: 0, label: "Meu apetite está como antes" }, { value: 1, label: "Meu apetite não está tão bom" }, { value: 2, label: "Meu apetite está muito pior agora" }, { value: 3, label: "Não tenho mais apetite" }] },
  { order: 19, text: "Peso", options: [{ value: 0, label: "Não perdi peso recentemente" }, { value: 1, label: "Perdi mais de 2 kg" }, { value: 2, label: "Perdi mais de 5 kg" }, { value: 3, label: "Perdi mais de 7 kg" }] },
  { order: 20, text: "Preocupação com a saúde", options: [{ value: 0, label: "Não me preocupo mais com minha saúde que o normal" }, { value: 1, label: "Estou preocupado com dores ou problemas de saúde" }, { value: 2, label: "Estou muito preocupado com minha saúde" }, { value: 3, label: "Estou tão preocupado com minha saúde que não consigo pensar em outra coisa" }] },
  { order: 21, text: "Libido", options: [{ value: 0, label: "Não notei mudança no meu interesse por sexo" }, { value: 1, label: "Estou menos interessado em sexo que antes" }, { value: 2, label: "Estou muito menos interessado em sexo" }, { value: 3, label: "Perdi completamente o interesse por sexo" }] },
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

  try {
  const firstPsych = await prisma.user.findFirst({ where: { role: "PSYCHOLOGIST" }, select: { id: true } })
  if (!firstPsych) { return NextResponse.json({ error: "Nenhum psicólogo encontrado" }, { status: 400 }) }
  const psychId = firstPsych.id

  const results: string[] = []

  const existingBeck = await prisma.questionnaire.findFirst({ where: { type: "BECK" } })
  if (existingBeck) {
    const existingQuestions = await prisma.questionnaireQuestion.findMany({ where: { questionnaireId: existingBeck.id }, orderBy: { questionOrder: "asc" } })
    for (let i = 0; i < existingQuestions.length && i < beckQuestions.length; i++) {
      await prisma.questionnaireQuestion.update({
        where: { id: existingQuestions[i].id },
        data: { options: JSON.stringify(beckQuestions[i].options || beckOptions), questionText: beckQuestions[i].text },
      })
    }
    results.push("BECK atualizado")
  } else {
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
            options: JSON.stringify(q.options || beckOptions),
            scaleMin: 0,
            scaleMax: 3,
          })),
        },
      },
    })
    results.push("BECK criado")
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
  } catch (e: any) { return NextResponse.json({ error: e?.message || String(e) }, { status: 500 }) }
}
