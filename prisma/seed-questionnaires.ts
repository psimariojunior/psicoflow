import { PrismaClient, QuestionnaireType } from "@prisma/client"

const prisma = new PrismaClient()

const phq9Questions = [
  { order: 1, text: "Pouco interesse ou prazer em fazer as coisas", category: "Depressão" },
  { order: 2, text: "Sentir-se triste, deprimido ou sem esperança", category: "Depressão" },
  { order: 3, text: "Dificuldade para dormir ou manter-se dormindo, ou dormir demais", category: "Depressão" },
  { order: 4, text: "Sentir-se cansado ou com pouca energia", category: "Depressão" },
  { order: 5, text: "Pouco apetite ou comer demais", category: "Depressão" },
  { order: 6, text: "Sentir-se mal sobre si mesmo — ou que é um fracasso ou decepcionou a si mesmo ou à sua família", category: "Depressão" },
  { order: 7, text: "Dificuldade para se concentrar nas coisas, como ler o jornal ou assistir à televisão", category: "Depressão" },
  { order: 8, text: "Mover-se ou falar tão devagar que outras pessoas poderiam notar? Ou o contrário — estar tão agitado ou inquieto que tem se movido muito mais que o habitual", category: "Depressão" },
  { order: 9, text: "Pensamentos de que seria melhor estar morto ou de se machucar de alguma forma", category: "Depressão" },
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
  { order: 1, text: "Com que frequência você ficou chateado por causa de algo que aconteceu inesperadamente?", reverse: false },
  { order: 2, text: "Com que frequência você sentiu que não conseguia controlar as coisas importantes da sua vida?", reverse: false },
  { order: 3, text: "Com que frequência você se sentiu nervoso ou estressado?", reverse: false },
  { order: 4, text: "Com que frequência você sentiu confiança na sua capacidade de lidar com seus problemas pessoais?", reverse: true },
  { order: 5, text: "Com que frequência você sentiu que as coisas estavam acontecendo do seu jeito?", reverse: true },
  { order: 6, text: "Com que frequência você achou que não conseguiria lidar com todas as coisas que tinha que fazer?", reverse: false },
  { order: 7, text: "Com que frequência você conseguiu controlar as irritações da sua vida?", reverse: true },
  { order: 8, text: "Com que frequência você sentiu que estava no controle das coisas?", reverse: true },
  { order: 9, text: "Com que frequência você ficou irritado porque as coisas estavam fora do seu controle?", reverse: false },
  { order: 10, text: "Com que frequência você sentiu que as dificuldades estavam se acumulando tanto que você não conseguiria superá-las?", reverse: false },
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

async function seedQuestionnaire(
  type: QuestionnaireType,
  title: string,
  description: string,
  questions: { order: number; text: string; category?: string; reverse?: boolean }[],
  options: { value: number; label: string }[],
  psychologistId: string,
) {
  const existing = await prisma.questionnaire.findFirst({ where: { type } })
  if (existing) {
    console.log(`⚠️ ${title} já existe`)
    return
  }

  await prisma.questionnaire.create({
    data: {
      type,
      title,
      description,
      isActive: true,
      psychologistId,
      questions: {
        create: questions.map(q => ({
          questionText: q.text,
          questionOrder: q.order,
          options: JSON.stringify(options),
          scaleMin: options[0].value,
          scaleMax: options[options.length - 1].value,
          category: q.category || null,
        })),
      },
    },
  })
  console.log(`✅ ${title} criado`)
}

async function main() {
  const psych = await prisma.user.findFirst({ where: { role: "PSYCHOLOGIST" } })
  const psychId = psych?.id || "system"

  const phq9Options = [
    { value: 0, label: "Nenhum dia" },
    { value: 1, label: "Vários dias" },
    { value: 2, label: "Mais da metade dos dias" },
    { value: 3, label: "Quase todos os dias" },
  ]

  const beckOptions = [
    { value: 0, label: "Alternativa A" },
    { value: 1, label: "Alternativa B" },
    { value: 2, label: "Alternativa C" },
    { value: 3, label: "Alternativa D" },
  ]

  const pssOptions = [
    { value: 0, label: "Nunca" },
    { value: 1, label: "Quase nunca" },
    { value: 2, label: "Às vezes" },
    { value: 3, label: "Frequentemente" },
    { value: 4, label: "Sempre" },
  ]

  const miniOptions = [
    { value: 0, label: "Não" },
    { value: 1, label: "Sim" },
  ]

  await seedQuestionnaire(QuestionnaireType.PHQ9, "PHQ-9 — Questionário de Saúde do Paciente", "Triagem e monitoramento da gravidade da depressão. Escala de 0 a 3 para cada item (0 = Nunca, 3 = Quase todos os dias). Pontuação total: 0-27.", phq9Questions, phq9Options, psychId)
  await seedQuestionnaire(QuestionnaireType.GAD7, "GAD-7 — Escala de Ansiedade Generalizada", "Triagem e monitoramento da gravidade da ansiedade generalizada. Escala de 0 a 3 para cada item (0 = Nunca, 3 = Quase todos os dias). Pontuação total: 0-21.", gad7Questions, phq9Options, psychId)
  await seedQuestionnaire(QuestionnaireType.BECK, "Inventário de Depressão de Beck (BDI)", "Avaliação da intensidade dos sintomas depressivos. 21 itens, escala 0-3.", beckQuestions, beckOptions, psychId)
  await seedQuestionnaire(QuestionnaireType.PSS, "Escala de Estresse Percebido (PSS-10)", "Avalia o nível de estresse percebido no último mês. 10 itens, escala 0-4.", pssQuestions, pssOptions, psychId)
  await seedQuestionnaire(QuestionnaireType.MINI, "MINI - Rastreio Inicial", "Triagem rápida para transtornos mentais. Responda SIM ou NÃO.", miniQuestions, miniOptions, psychId)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
