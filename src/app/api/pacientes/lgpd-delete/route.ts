import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPatientToken } from "@/lib/patient-auth"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const token = await verifyPatientToken(authHeader.slice(7))
    if (!token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const patientId = token.patientId

    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)

    const recentRecords = await prisma.medicalRecord.count({
      where: {
        patientId,
        createdAt: { gt: fiveYearsAgo },
      },
    })

    if (recentRecords > 0) {
      return NextResponse.json(
        {
          error: "Não é possível excluir conta: existem prontuários clínicos com menos de 5 anos.",
          detail: "Conforme Resolução CFP nº 06/2019, prontuários devem ser mantidos por no mínimo 5 anos. Após esse período, seus dados serão removidos automaticamente.",
          recordsCount: recentRecords,
        },
        { status: 403 }
      )
    }

    await prisma.$transaction([
      prisma.emotionDiary.deleteMany({ where: { patientId } }),
      prisma.questionnaireResponse.deleteMany({ where: { patientId } }),
      prisma.therapyTask.deleteMany({ where: { patientId } }),
      prisma.invoice.deleteMany({ where: { patientId } }),
      prisma.appointment.deleteMany({ where: { patientId } }),
      prisma.consentLog.deleteMany({ where: { patientId } }),
      prisma.notification.deleteMany({ where: { patientId } }),
      prisma.patient.delete({ where: { id: patientId } }),
    ])

    logger.info("Patient self-deleted (LGPD)", { patientId })

    return NextResponse.json({
      success: true,
      message: "Seus dados foram removidos com sucesso conforme seu direito de esquecimento (LGPD).",
    })
  } catch (error) {
    logger.error("LGPD delete failed", { error: String(error) })
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
