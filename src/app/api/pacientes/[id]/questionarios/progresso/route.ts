import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function getSeverity(type: string, score: number): string {
  switch (type) {
    case "PHQ9":
      if (score >= 20) return "Severa"
      if (score >= 15) return "Moderadamente severa"
      if (score >= 10) return "Moderada"
      if (score >= 5) return "Leve"
      return "Mínima"
    case "GAD7":
      if (score >= 15) return "Severa"
      if (score >= 10) return "Moderada"
      if (score >= 5) return "Leve"
      return "Mínima"
    case "BECK":
      if (score > 40) return "Extrema"
      if (score >= 31) return "Grave"
      if (score >= 21) return "Moderada"
      if (score >= 17) return "Limítrofe"
      if (score >= 11) return "Leve"
      return "Normal"
    case "PSS":
      if (score >= 27) return "Alto"
      if (score >= 14) return "Moderado"
      return "Baixo"
    case "MINI":
      if (score >= 6) return "Alto"
      if (score >= 3) return "Moderado"
      return "Baixo"
    default:
      return "Não classificado"
  }
}

function calculateTrend(current: number, previous: number | null): "improving" | "stable" | "worsening" {
  if (previous === null) return "stable"
  const diff = current - previous
  if (Math.abs(diff) <= 1) return "stable"
  return diff < 0 ? "improving" : "worsening"
}

const typeLabels: Record<string, string> = {
  PHQ9: "PHQ-9",
  GAD7: "GAD-7",
  BECK: "BDI",
  PSS: "PSS-10",
  MINI: "MINI",
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const patient = await prisma.patient.findFirst({
      where: { id, psychologistId: session.user.id },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const responses = await prisma.questionnaireResponse.findMany({
      where: {
        patientId: id,
        psychologistId: session.user.id,
      },
      include: {
        questionnaire: {
          select: { id: true, title: true, type: true },
        },
      },
      orderBy: { completedAt: "desc" },
    })

    const grouped: Record<string, {
      typeLabel: string
      responses: {
        id: string
        completedAt: string
        totalScore: number
        severity: string
      }[]
      latestScore: number
      previousScore: number | null
      change: number | null
      trend: "improving" | "stable" | "worsening"
      severity: string
    }> = {}

    for (const r of responses) {
      const type = r.questionnaire.type
      if (!grouped[type]) {
        grouped[type] = {
          typeLabel: typeLabels[type] || type,
          responses: [],
          latestScore: 0,
          previousScore: null,
          change: null,
          trend: "stable",
          severity: "Mínima",
        }
      }
      grouped[type].responses.push({
        id: r.id,
        completedAt: r.completedAt.toISOString(),
        totalScore: r.totalScore ?? 0,
        severity: r.severity || getSeverity(type, r.totalScore ?? 0),
      })
    }

    for (const [type, data] of Object.entries(grouped)) {
      const sorted = data.responses.sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      )
      data.latestScore = sorted[0]?.totalScore ?? 0
      data.previousScore = sorted[1]?.totalScore ?? null
      data.change = data.previousScore !== null ? data.latestScore - data.previousScore : null
      data.trend = calculateTrend(data.latestScore, data.previousScore)
      data.severity = sorted[0]?.severity || getSeverity(type, data.latestScore)
    }

    return NextResponse.json(grouped)
  } catch (error) {
    console.error("Erro ao buscar progresso:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
