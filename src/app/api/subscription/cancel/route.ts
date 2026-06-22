import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"
import { getStripe } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const userId = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true },
    })

    if (!user?.stripeSubscriptionId) {
      return apiError("Nenhuma assinatura ativa encontrada.", 400)
    }

    const sub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: user.stripeSubscriptionId },
      select: { stripeSubscriptionId: true, status: true },
    })

    if (!sub || sub.status !== "active") {
      return apiError("Assinatura não está ativa.", 400)
    }

    const stripe = getStripe()
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })

    await prisma.subscription.update({
      where: { stripeSubscriptionId: sub.stripeSubscriptionId },
      data: { cancelAtPeriodEnd: true },
    })

    return apiSuccess({ message: "Assinatura será cancelada ao final do período." })
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return apiError("Erro ao cancelar assinatura")
  }
}
