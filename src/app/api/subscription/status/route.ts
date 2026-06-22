import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"
import { isPlanActive } from "@/lib/plan"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const userId = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        planExpiresAt: true,
        subscriptionStatus: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        subscription: {
          select: {
            stripeSubscriptionId: true,
            plan: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        },
      },
    })

    if (!user) {
      return apiError("Usuário não encontrado", 404)
    }

    const active = isPlanActive(user.plan as "free" | "trial" | "pro" | "clinica", user.planExpiresAt)

    return apiSuccess({
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
      subscriptionStatus: active ? user.subscriptionStatus : "expired",
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripeCustomerId: user.stripeCustomerId,
      subscription: user.subscription,
    })
  } catch (error) {
    console.error("Error fetching subscription status:", error)
    return apiError("Erro ao buscar status da assinatura")
  }
}
