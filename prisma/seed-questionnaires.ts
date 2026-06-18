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

async function main() {
  const existingPhq9 = await prisma.questionnaire.findFirst({
    where: { type: QuestionnaireType.PHQ9 },
  })

  if (!existingPhq9) {
    await prisma.questionnaire.create({
      data: {
        type: QuestionnaireType.PHQ9,
        title: "PHQ-9 — Questionário de Saúde do Paciente",
        description: "Triagem e monitoramento da gravidade da depressão. Escala de 0 a 3 para cada item (0 = Nunca, 3 = Quase todos os dias). Pontuação total: 0-27.",
        isActive: true,
        psychologistId: "system", // Will be overridden if real psychologist
        questions: {
          create: phq9Questions.map(q => ({
            questionText: q.text,
            questionOrder: q.order,
            options: JSON.stringify([
              { value: 0, label: "Nenhum dia" },
              { value: 1, label: "Vários dias" },
              { value: 2, label: "Mais da metade dos dias" },
              { value: 3, label: "Quase todos os dias" },
            ]),
            scaleMin: 0,
            scaleMax: 3,
            category: q.category,
          })),
        },
      },
    })
    console.log("✅ PHQ-9 criado")
  } else {
    console.log("⚠️ PHQ-9 já existe")
  }

  const existingGad7 = await prisma.questionnaire.findFirst({
    where: { type: QuestionnaireType.GAD7 },
  })

  if (!existingGad7) {
    await prisma.questionnaire.create({
      data: {
        type: QuestionnaireType.GAD7,
        title: "GAD-7 — Escala de Ansiedade Generalizada",
        description: "Triagem e monitoramento da gravidade da ansiedade generalizada. Escala de 0 a 3 para cada item (0 = Nunca, 3 = Quase todos os dias). Pontuação total: 0-21.",
        isActive: true,
        psychologistId: "system",
        questions: {
          create: gad7Questions.map(q => ({
            questionText: q.text,
            questionOrder: q.order,
            options: JSON.stringify([
              { value: 0, label: "Nenhum dia" },
              { value: 1, label: "Vários dias" },
              { value: 2, label: "Mais da metade dos dias" },
              { value: 3, label: "Quase todos os dias" },
            ]),
            scaleMin: 0,
            scaleMax: 3,
            category: q.category,
          })),
        },
      },
    })
    console.log("✅ GAD-7 criado")
  } else {
    console.log("⚠️ GAD-7 já existe")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })