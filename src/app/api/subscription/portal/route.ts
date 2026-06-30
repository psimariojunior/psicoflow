import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"
import { getStripe } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
      return apiError("Nenhuma assinatura encontrada. Faça um upgrade primeiro.", 400)
    }

    const stripe = getStripe()
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/configuracoes`,
    })

    return apiSuccess({ url: session.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return apiError("Erro ao criar sessão do portal")
  }
}
