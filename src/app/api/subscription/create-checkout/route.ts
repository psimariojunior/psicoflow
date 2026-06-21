import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"
import { getStripe } from "@/lib/stripe"
import { z } from "zod"

const checkoutSchema = z.object({
  plan: z.enum(["pro", "clinica"]),
})

const PRICES: Record<string, { amount: number; name: string }> = {
  pro: { amount: 9700, name: "PsicoFlow Pro" },
  clinica: { amount: 19700, name: "PsicoFlow Clínica" },
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth()

    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      return apiError("Parâmetros inválidos: plan deve ser 'pro' ou 'clinica'", 400)
    }

    const { plan } = parsed.data
    const priceConfig = PRICES[plan]

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, stripeCustomerId: true, stripeSubscriptionId: true },
    })

    if (!user) {
      return apiError("Usuário não encontrado", 404)
    }

    const stripe = getStripe()

    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      })
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: priceConfig.name,
              description: `Assinatura ${priceConfig.name} - PsicoFlow`,
            },
            unit_amount: priceConfig.amount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: user.stripeSubscriptionId ? undefined : 14,
        metadata: { userId, plan },
      },
      metadata: { userId, plan },
      success_url: `${origin}/configuracoes?upgraded=true`,
      cancel_url: `${origin}/configuracoes?upgrade=cancelled`,
    })

    await prisma.user.update({
      where: { id: userId },
      data: { stripeSubscriptionId: session.id },
    })

    return apiSuccess({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return apiError("Erro ao criar sessão de checkout")
  }
}
