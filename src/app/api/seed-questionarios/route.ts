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

const optionsPss = JSON.stringify([
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

const optionsIsi = JSON.stringify([
  { value: 0, label: "Nenhum" },
  { value: 1, label: "Leve" },
  { value: 2, label: "Moderado" },
  { value: 3, label: "Grave" },
  { value: 4, label: "Muito grave" },
])

const optionsWhoqolAvaliacao = JSON.stringify([
  { value: 1, label: "Muito ruim" },
  { value: 2, label: "Ruim" },
  { value: 3, label: "Nem bom nem ruim" },
  { value: 4, label: "Bom" },
  { value: 5, label: "Muito bom" },
])

const optionsWhoqolSatisfacao = JSON.stringify([
  { value: 1, label: "Muito insatisfeito(a)" },
  { value: 2, label: "Insatisfeito(a)" },
  { value: 3, label: "Nem satisfeito nem insatisfeito" },
  { value: 4, label: "Satisfeito(a)" },
  { value: 5, label: "Muito satisfeito(a)" },
])

interface QuestionDef { order: number; text: string; category: string; options?: string }

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
      { order: 1, text: "Dormência ou formigamento — sinto dormência ou formigamento no corpo", category: "Ansiedade" },
      { order: 2, text: "Sentir-se calor — sinto ondas de calor ou sudorese", category: "Ansiedade" },
      { order: 3, text: "Tremores nas mãos — minhas mãos tremem ou balançam", category: "Ansiedade" },
      { order: 4, text: "Dificuldade para relaxar — tenho dificuldade em relaxar", category: "Ansiedade" },
      { order: 5, text: "Medo — tenho medo de que coisas ruins aconteçam", category: "Ansiedade" },
      { order: 6, text: "Vertigem ou tontura — sinto tontura ou vertigem", category: "Ansiedade" },
      { order: 7, text: "Palpitação ou aceleração cardíaca — sinto o coração acelerado ou batendo forte", category: "Ansiedade" },
      { order: 8, text: "Falta de equilíbrio — sinto que vou cair ou que não estou firme", category: "Ansiedade" },
      { order: 9, text: "Assustado(a) — fico assustado(a) facilmente", category: "Ansiedade" },
      { order: 10, text: "Nervosismo — sinto os nervos à flor da pele", category: "Ansiedade" },
      { order: 11, text: "Ofegante — tenho dificuldade para respirar ou sinto falta de ar", category: "Ansiedade" },
      { order: 12, text: "Morte — tenho medo de morrer", category: "Ansiedade" },
      { order: 13, text: "Pânico — sinto pânico ou medo intenso", category: "Ansiedade" },
      { order: 14, text: "Engasgo ou sufocamento — sinto que vou engasgar ou me sufocar", category: "Ansiedade" },
      { order: 15, text: "Dor no peito — sinto dor ou desconforto no peito", category: "Ansiedade" },
      { order: 16, text: "Inquietação — sinto o corpo muito agitado ou inquieto", category: "Ansiedade" },
      { order: 17, text: "Fraqueza — sinto fraqueza ou cansaço nas pernas", category: "Ansiedade" },
      { order: 18, text: "Indigestão — sinto enjoo ou desconforto no estômago", category: "Ansiedade" },
      { order: 19, text: "Suor — sinto sudorese excessiva (sem estar quente ou fazendo exercício)", category: "Ansiedade" },
      { order: 20, text: "Vermelhidão — fico vermelho(a) ou sinto calor no rosto", category: "Ansiedade" },
      { order: 21, text: "Dificuldade para dormir — tenho dificuldade para pegar no sono ou durmo mal", category: "Ansiedade" },
    ],
  },
  {
    type: "BDI", title: "BDI-II — Inventário de Depressão de Beck",
    description: "Mede a gravidade dos sintomas depressivos em adultos e adolescentes.",
    category: "Depressão", options: optionsBai,
    questions: [
      { order: 1, text: "Tristeza — me sinto para baixo, triste ou sem esperança", category: "Depressão" },
      { order: 2, text: "Pessimismo — não vejo sentido nas coisas nem acredito que as coisas vão melhorar", category: "Depressão" },
      { order: 3, text: "Sentimento de fracasso — sinto que fracassei ou que decepcione a mim mesmo(a)", category: "Depressão" },
      { order: 4, text: "Perda de prazer — não tenho prazer em fazer as coisas que costumo gostar", category: "Depressão" },
      { order: 5, text: "Culpa — me sinto culpado(a) ou me punishment pelas coisas que fiz ou deixei de fazer", category: "Depressão" },
      { order: 6, text: "Sentimento de punição — sinto que devo ser punido(a) pelas coisas que fiz", category: "Depressão" },
      { order: 7, text: "Ódio contra si mesmo — me critico muito e tenho raiva de mim mesmo(a)", category: "Depressão" },
      { order: 8, text: "Autocrítica — me julgo severamente pelas minhas falas ou erros", category: "Depressão" },
      { order: 9, text: "Ideação suicida — penso em me machucar ou que seria melhor estar morto(a)", category: "Depressão" },
      { order: 10, text: "Choro — choro mais do que o habitual ou sinto vontade de chorar sem motivo", category: "Depressão" },
      { order: 11, text: "Agitação — tenho dificuldade em ficar parado(a) ou me sinto muito inquieto(a)", category: "Depressão" },
      { order: 12, text: "Perda de interesse — perdi interesse nas coisas que antes me davam prazer", category: "Depressão" },
      { order: 13, text: "Indecisão — tenho dificuldade para tomar decisões ou me concentrar", category: "Depressão" },
      { order: 14, text: "Desvalorização — me sinto sem valor ou inútil", category: "Depressão" },
      { order: 15, text: "Falta de energia — me sinto cansado(a) demais para fazer qualquer coisa", category: "Depressão" },
      { order: 16, text: "Alteração no sono — durmo muito mais ou muito menos que o normal", category: "Depressão" },
      { order: 17, text: "Irritabilidade — fico mais irritado(a) ou impaciente com os outros", category: "Depressão" },
      { order: 18, text: "Alteração no apetite — como muito mais ou muito menos que o normal", category: "Depressão" },
      { order: 19, text: "Dificuldade de concentração — tenho dificuldade para prestar atenção nas coisas", category: "Depressão" },
      { order: 20, text: "Cansaço — me sinto extremamente cansado(a) ou sem energia", category: "Depressão" },
      { order: 21, text: "Perda de interesse sexual — perdi interesse em atividades sexuais", category: "Depressão" },
    ],
  },
  {
    type: "PSS", title: "PSS-10 — Escala de Estresse Percebido",
    description: "Mede o grau de estresse percebido nas últimas 4 semanas.",
    category: "Estresse", options: optionsPss,
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
    category: "Sono", options: optionsIsi,
    questions: [
      { order: 1, text: "Dificuldade para adormecer no horário desejado", category: "Sono" },
      { order: 2, text: "Dificuldade para manter o sono durante a noite", category: "Sono" },
      { order: 3, text: "Despertar precoce pela manhã", category: "Sono" },
      { order: 4, text: "Satisfação com o padrão de sono atual", category: "Sono" },
      { order: 5, text: "Preocupação com o sono", category: "Sono" },
      { order: 6, text: "Interferência do sono nas atividades diurnas", category: "Sono" },
      { order: 7, text: "Quanto os problemas de sono afetam sua qualidade de vida", category: "Sono" },
    ],
  },
  {
    type: "WHOQOL", title: "WHOQOL-Bref — Qualidade de Vida",
    description: "Avalia a qualidade de vida em 4 domínios: físico, psicológico, relações e ambiente.",
    category: "Qualidade de Vida", options: optionsWhoqolAvaliacao,
    questions: [
      { order: 1, text: "Como você avalia sua qualidade de vida?", category: "Físico", options: optionsWhoqolAvaliacao },
      { order: 2, text: "Quão satisfeito(a) você está com sua saúde?", category: "Físico", options: optionsWhoqolSatisfacao },
      { order: 3, text: "Quão satisfeito(a) você está com sua capacidade de realizar as atividades do dia a dia?", category: "Físico", options: optionsWhoqolSatisfacao },
      { order: 4, text: "Quão satisfeito(a) você está com sua capacidade de trabalhar?", category: "Físico", options: optionsWhoqolSatisfacao },
      { order: 5, text: "Quão satisfeito(a) você está consigo mesmo(a)?", category: "Psicológico", options: optionsWhoqolSatisfacao },
      { order: 6, text: "Quão satisfeito(a) você está com seus relacionamentos pessoais?", category: "Relacionamentos", options: optionsWhoqolSatisfacao },
      { order: 7, text: "Quão satisfeito(a) você está com o apoio que recebe das pessoas ao seu redor?", category: "Relacionamentos", options: optionsWhoqolSatisfacao },
      { order: 8, text: "Quão satisfeito(a) você está com as condições do seu local de moradia?", category: "Ambiente", options: optionsWhoqolSatisfacao },
      { order: 9, text: "Quão satisfeito(a) você está com seu acesso a serviços de saúde?", category: "Ambiente", options: optionsWhoqolSatisfacao },
      { order: 10, text: "Quão satisfeito(a) você está com suas condições financeiras?", category: "Ambiente", options: optionsWhoqolSatisfacao },
      { order: 11, text: "Quão satisfeito(a) você está com as informações disponíveis para suas necessidades cotidianas?", category: "Ambiente", options: optionsWhoqolSatisfacao },
      { order: 12, text: "Quão satisfeito(a) você está com o transporte disponível?", category: "Ambiente", options: optionsWhoqolSatisfacao },
      { order: 13, text: "Quão satisfeito(a) você está com a segurança do seu dia a dia?", category: "Ambiente", options: optionsWhoqolSatisfacao },
      { order: 14, text: "Quão satisfeito(a) você está com o estado do seu ambiente natural (clima, natureza)?", category: "Ambiente", options: optionsWhoqolSatisfacao },
      { order: 15, text: "Quão satisfeito(a) você está com sua aparência física?", category: "Psicológico", options: optionsWhoqolSatisfacao },
      { order: 16, text: "Quão satisfeito(a) você está com sua energia para o dia a dia?", category: "Físico", options: optionsWhoqolSatisfacao },
      { order: 17, text: "Quão satisfeito(a) você está com sua capacidade de pensar e tomar decisões?", category: "Psicológico", options: optionsWhoqolSatisfacao },
      { order: 18, text: "Quão satisfeito(a) você está com sua felicidade?", category: "Psicológico", options: optionsWhoqolSatisfacao },
      { order: 19, text: "Quão satisfeito(a) você está com sua atividade sexual?", category: "Físico", options: optionsWhoqolSatisfacao },
      { order: 20, text: "Quão satisfeito(a) você está com a satisfação que recebe de seus amigos?", category: "Relacionamentos", options: optionsWhoqolSatisfacao },
      { order: 21, text: "Quão satisfeito(a) você está com as condições do seu dia a dia?", category: "Ambiente", options: optionsWhoqolSatisfacao },
      { order: 22, text: "Quão satisfeito(a) você está com a possibilidade de fazer coisas do seu interesse?", category: "Físico", options: optionsWhoqolSatisfacao },
      { order: 23, text: "Quão satisfeito(a) você está com sua capacidade de desempenhar suas tarefas diárias?", category: "Físico", options: optionsWhoqolSatisfacao },
      { order: 24, text: "Quão satisfeito(a) você está com sua saúde para cumprir suas necessidades?", category: "Físico", options: optionsWhoqolSatisfacao },
      { order: 25, text: "Quão satisfeito(a) você está com sua vida sexual?", category: "Físico", options: optionsWhoqolSatisfacao },
      { order: 26, text: "Quão satisfeito(a) você está com o apoio que recebe de seus familiares?", category: "Relacionamentos", options: optionsWhoqolSatisfacao },
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
  const force = searchParams.get("force") === "true"

  const results: string[] = []

  for (const def of questionnaireDefs) {
    const existing = await prisma.questionnaire.findFirst({ where: { type: def.type } })
    if (existing) {
      if (force) {
        await prisma.questionnaireResponse.deleteMany({ where: { questionnaireId: existing.id } })
        await prisma.questionnaireQuestion.deleteMany({ where: { questionnaireId: existing.id } })
        await prisma.questionnaire.delete({ where: { id: existing.id } })
        await prisma.questionnaire.create({
          data: {
            type: def.type,
            title: def.title,
            description: def.description,
            isActive: true,
            psychologistId: psychId,
            questions: { create: def.questions.map(q => ({ questionText: q.text, questionOrder: q.order, options: q.options || def.options, category: q.category })) },
          },
        })
        results.push(`${def.type} recriado (force)`)
      } else {
        results.push(`${def.type} já existe`)
      }
    } else {
      await prisma.questionnaire.create({
        data: {
          type: def.type,
          title: def.title,
          description: def.description,
          isActive: true,
          psychologistId: psychId,
          questions: { create: def.questions.map(q => ({ questionText: q.text, questionOrder: q.order, options: q.options || def.options, category: q.category })) },
        },
      })
      results.push(`${def.type} criado`)
    }
  }

  return NextResponse.json({ results })
}
