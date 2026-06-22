import { NextResponse } from "next/server"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const userId = await requireAuth()

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!currentUser || currentUser.role !== "ADMIN") {
      return apiError("Acesso negado", 403)
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        subscriptionStatus: true,
        planExpiresAt: true,
        createdAt: true,
        _count: {
          select: {
            patients: true,
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return apiSuccess({ users })
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return apiError("Erro ao buscar usuários")
  }
}
