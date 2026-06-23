import { NextResponse } from "next/server"
import { PrismaClient, QuestionnaireType } from "@prisma/client"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

const prisma = new PrismaClient()

const options4 = JSON.stringify([
  { value: 0, label: "Nenhum dia" },
  { value: 1, label: "Vários dias" },
  { value: 2, label: "Mais da metade dos dias" },
  { value: 3, label: "Quase todos os dias" },
])

const options5 = JSON.stringify([
  { value: 0, label: "Nunca" },
  { value: 1, label: "Raramente" },
  { value: 2, label: "Às vezes" },
  { value: 3, label: "Frequentemente" },
  { value: 4, label: "Sempre" },
])

const optionsBai = JSON.stringify([
  { value: 0, label: "Ausente" },
  { value: 1, label: "Leve" },
  { value: 2, label: "Moderado" },
  { value: 3, label: "Grave" },
])

interface QuestionDef { order: number; text: string; category: string }

const questionnaireDefs: {
  type: QuestionnaireType; title: string; description: string; category: string
  options: string; questions: QuestionDef[]
}[] = [
  {
    type: "PHQ9", title: "PHQ-9 — Questionário de Saúde do Paciente",
    description: "Triagem e monitoramento da gravidade da depressão.",
    category: "Depressão", options: options4,
    questions: [
      { order: 1, text: "Pouco interesse ou prazer em fazer as coisas", category: "Depressão" },
      { order: 2, text: "Sentir-se triste, deprimido ou sem esperança", category: "Depressão" },
      { order: 3, text: "Dificuldade para dormir ou manter-se dormindo, ou dormir demais", category: "Depressão" },
      { order: 4, text: "Sentir-se cansado ou com pouca energia", category: "Depressão" },
      { order: 5, text: "Pouco apetite ou comer demais", category: "Depressão" },
      { order: 6, text: "Sentir-se mal sobre si mesmo", category: "Depressão" },
      { order: 7, text: "Dificuldade para se concentrar", category: "Depressão" },
      { order: 8, text: "Mover-se ou falar muito devagar", category: "Depressão" },
      { order: 9, text: "Pensamentos de que seria melhor estar morto", category: "Depressão" },
    ],
  },
  {
    type: "GAD7", title: "GAD-7 — Escala de Ansiedade Generalizada",
    description: "Triagem e monitoramento da gravidade da ansiedade.",
    category: "Ansiedade", options: options4,
    questions: [
      { order: 1, text: "Sentir-se nervoso, ansioso ou tenso", category: "Ansiedade" },
      { order: 2, text: "Não conseguir parar ou controlar as preocupações", category: "Ansiedade" },
      { order: 3, text: "Preocupar-se excessivamente com coisas diferentes", category: "Ansiedade" },
      { order: 4, text: "Dificuldade para relaxar", category: "Ansiedade" },
      { order: 5, text: "Ficar tão inquieto que fica difícil ficar parado", category: "Ansiedade" },
      { order: 6, text: "Ficar facilmente irritado ou aborrecido", category: "Ansiedade" },
      { order: 7, text: "Sentir medo como se algo terrível fosse acontecer", category: "Ansiedade" },
    ],
  },
  {
    type: "BAI", title: "BAI — Inventário de Ansiedade de Beck",
    description: "Mede a gravidade dos sintomas de ansiedade em adultos e adolescentes.",
    category: "Ansiedade", options: optionsBai,
    questions: [
      { order: 1, text: "Dormência ou formigamento", category: "Ansiedade" },
      { order: 2, text: "Sentir-se calor", category: "Ansiedade" },
      { order: 3, text: "Tremores nas pernas", category: "Ansiedade" },
      { order: 4, text: "Não conseguir relaxar", category: "Ansiedade" },
      { order: 5, text: "Medo que aconteça o pior", category: "Ansiedade" },
      { order: 6, text: "Tontura ou vertigem", category: "Ansiedade" },
      { order: 7, text: "Palpitação ou aceleração cardíaca", category: "Ansiedade" },
      { order: 8, text: "Falta de equilíbrio", category: "Ansiedade" },
      { order: 9, text: "Assustado(a)", category: "Ansiedade" },
      { order: 10, text: "Nervoso(a)", category: "Ansiedade" },
      { order: 11, text: "Sensação de sufocação", category: "Ansiedade" },
      { order: 12, text: "Dores ou desconforto no peito", category: "Ansiedade" },
      { order: 13, text: "Passos tropieçam ao andar", category: "Ansiedade" },
      { order: 14, text: "Fadiga ou cansaço", category: "Ansiedade" },
      { order: 15, text: "Ficar ao lado de pessoas nervosas", category: "Ansiedade" },
      { order: 16, text: "Perder o apetite", category: "Ansiedade" },
      { order: 17, text: "Indigestão ou desconforto abdominal", category: "Ansiedade" },
      { order: 18, text: "Frequência respiratória aumentada", category: "Ansiedade" },
      { order: 19, text: "Sudorese (não devida ao calor)", category: "Ansiedade" },
      { order: 20, text: "Mãos frias e suadas", category: "Ansiedade" },
      { order: 21, text: "Rosto envergonhado", category: "Ansiedade" },
    ],
  },
  {
    type: "BDI", title: "BDI-II — Inventário de Depressão de Beck",
    description: "Mede a gravidade dos sintomas depressivos em adultos e adolescentes.",
    category: "Depressão", options: options4,
    questions: [
      { order: 1, text: "Tristeza", category: "Depressão" },
      { order: 2, text: "Pessimismo", category: "Depressão" },
      { order: 3, text: "Sentimento de fracasso", category: "Depressão" },
      { order: 4, text: "Perda de prazer", category: "Depressão" },
      { order: 5, text: "Culpa", category: "Depressão" },
      { order: 6, text: "Punição", category: "Depressão" },
      { order: 7, text: "Ódio contra si mesmo", category: "Depressão" },
      { order: 8, text: "Autocrítica", category: "Depressão" },
      { order: 9, text: "Ideação suicida", category: "Depressão" },
      { order: 10, text: "Choro", category: "Depressão" },
      { order: 11, text: "Agitação", category: "Depressão" },
      { order: 12, text: "Perda de interesse", category: "Depressão" },
      { order: 13, text: "Indecisão", category: "Depressão" },
      { order: 14, text: "Desvalorização", category: "Depressão" },
      { order: 15, text: "Falta de energia", category: "Depressão" },
      { order: 16, text: "Alteração no sono", category: "Depressão" },
      { order: 17, text: "Irritabilidade", category: "Depressão" },
      { order: 18, text: "Alteração no apetite", category: "Depressão" },
      { order: 19, text: "Dificuldade de concentração", category: "Depressão" },
      { order: 20, text: "Cansaço", category: "Depressão" },
      { order: 21, text: "Perda de interesse sexual", category: "Depressão" },
    ],
  },
  {
    type: "PSS", title: "PSS-10 — Escala de Estresse Percebido",
    description: "Mede o grau de estresse percebido nas últimas 4 semanas.",
    category: "Estresse", options: options5,
    questions: [
      { order: 1, text: "Ficar nervoso(a) ou aborrecido(a) com coisas inesperadas", category: "Estresse" },
      { order: 2, text: "Sentir que não consegue controlar as coisas importantes da vida", category: "Estresse" },
      { order: 3, text: "Sentir-se estressado(a) e sobrecarregado(a)", category: "Estresse" },
      { order: 4, text: "Sentir que estão acumulando tantas coisas que não consegue superá-las", category: "Estresse" },
      { order: 5, text: "Enfrentar coisas com sucesso nos últimos tempos", category: "Estresse" },
      { order: 6, text: "Sentir que não consegue lidar com todas as coisas que tem que fazer", category: "Estresse" },
      { order: 7, text: "Conseguir controlar as irritações na vida", category: "Estresse" },
      { order: 8, text: "Sentir que tem tudo sob controle", category: "Estresse" },
      { order: 9, text: "Sentir que é incapaz de lidar com todos os problemas", category: "Estresse" },
      { order: 10, text: "Coisas estarem fora do seu controle", category: "Estresse" },
    ],
  },
  {
    type: "ISI", title: "ISI — Índice de Gravidade da Insônia",
    description: "Avalia a natureza, gravidade e impacto da insônia.",
    category: "Sono", options: options5,
    questions: [
      { order: 1, text: "Dificuldade para adormecer no horário desejado", category: "Sono" },
      { order: 2, text: "Dificuldade para manter o sono durante a noite", category: "Sono" },
      { order: 3, text: "Despertar precoce pela manhã", category: "Sono" },
      { order: 4, text: "Satisfação com o padrão de sono atual", category: "Sono" },
      { order: 5, text: "Preocupação com o sono", category: "Sono" },
      { order: 6, text: "Interferência do sono nas atividades diurnas", category: "Sono" },
      { order: 7, text: "Notar os efeitos do problema de sono nas others", category: "Sono" },
    ],
  },
  {
    type: "WHOQOL", title: "WHOQOL-Bref — Qualidade de Vida",
    description: "Avalia a qualidade de vida em 4 domínios: físico, psicológico, relações e ambiente.",
    category: "Qualidade de Vida", options: options5,
    questions: [
      { order: 1, text: "Como você avalia sua qualidade de vida?", category: "Físico" },
      { order: 2, text: "Satisfação com sua saúde", category: "Físico" },
      { order: 3, text: "Satisfação com o quanto você consegue realizar atividades cotidianas", category: "Físico" },
      { order: 4, text: "Satisfação com sua capacidade de trabalho", category: "Físico" },
      { order: 5, text: "Satisfação consigo mesmo", category: "Psicológico" },
      { order: 6, text: "Satisfação com seus relacionamentos pessoais", category: "Relacionamentos" },
      { order: 7, text: "Satisfação com seu apoio social", category: "Relacionamentos" },
      { order: 8, text: "Satisfação com as condições do seu local de moradia", category: "Ambiente" },
      { order: 9, text: "Satisfação com seu acesso a serviços de saúde", category: "Ambiente" },
      { order: 10, text: "Satisfação com suas condições financeiras", category: "Ambiente" },
      { order: 11, text: "Satisfação com informações disponíveis para suas necessidades", category: "Ambiente" },
      { order: 12, text: "Satisfação com o transporte disponível", category: "Ambiente" },
      { order: 13, text: "Satisfação com a segurança do seu dia a dia", category: "Ambiente" },
      { order: 14, text: "Satisfação com o estado do seu ambiente natural", category: "Ambiente" },
      { order: 15, text: "Satisfação com sua aparência física", category: "Psicológico" },
      { order: 16, text: "Satisfação com sua energia para o dia a dia", category: "Físico" },
      { order: 17, text: "Satisfação com sua capacidade de pensar e tomar decisões", category: "Psicológico" },
      { order: 18, text: "Satisfação com sua felicidade", category: "Psicológico" },
      { order: 19, text: "Satisfação com sua satisfação sexual", category: "Físico" },
      { order: 20, text: "Satisfação com a satisfação que recebe de seus amigos", category: "Relacionamentos" },
      { order: 21, text: "Satisfação com as condições do seu dia a dia", category: "Ambiente" },
      { order: 22, text: "Satisfação com a possibilidade de fazer coisas do seu interesse", category: "Físico" },
      { order: 23, text: "Satisfação com sua capacidade de desempenhar suas tarefas diárias", category: "Físico" },
      { order: 24, text: "Satisfação com sua saúde para cumprir suas necessidades", category: "Físico" },
      { order: 25, text: "Satisfação com sua vida sexual", category: "Físico" },
      { order: 26, text: "Satisfação com o apoio que recebe de seus familiares", category: "Relacionamentos" },
    ],
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (!safeCompare(searchParams.get("secret") || "", process.env.CRON_SECRET || "")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const firstPsych = await prisma.user.findFirst({ where: { role: { in: ["PSYCHOLOGIST", "ADMIN"] } }, select: { id: true } })
  if (!firstPsych) {
    return NextResponse.json({ error: "Nenhum psicólogo encontrado no banco" }, { status: 400 })
  }
  const psychId = firstPsych.id

  const results: string[] = []

  for (const def of questionnaireDefs) {
    const existing = await prisma.questionnaire.findFirst({ where: { type: def.type } })
    if (!existing) {
      await prisma.questionnaire.create({
        data: {
          type: def.type,
          title: def.title,
          description: def.description,
          isActive: true,
          psychologistId: psychId,
          questions: { create: def.questions.map(q => ({ questionText: q.text, questionOrder: q.order, options: def.options, category: q.category })) },
        },
      })
      results.push(`${def.type} criado`)
    } else {
      results.push(`${def.type} já existe`)
    }
  }

  return NextResponse.json({ results })
}
