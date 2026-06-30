import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"
import { getStripe } from "@/lib/stripe"
import { z } from "zod"

export const dynamic = "force-dynamic"

const checkoutSchema = z.object({
  plan: z.enum(["pro", "clinica"]),
})

const PRICES: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_1TkpZ9KOBHid1iO0ki42h5Pb",
  clinica: process.env.STRIPE_CLINICA_PRICE_ID || "price_1TkpZ9KOBHid1iO0EDp5OoTz",
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
    const priceId = PRICES[plan]

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, stripeCustomerId: true, stripeSubscriptionId: true, referredById: true },
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

    let referralDiscount: string | undefined
    if (user.referredById) {
      try {
        const coupons = await stripe.coupons.list({ limit: 100 })
        let coupon = coupons.data.find((c) => c.id === "REFERRAL_10")
        if (!coupon) {
          coupon = await stripe.coupons.create({
            id: "REFERRAL_10",
            percent_off: 10,
            duration: "once",
            name: "10% off - Indicação",
          })
        }
        referralDiscount = coupon.id
      } catch {}
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      discounts: referralDiscount ? [{ coupon: referralDiscount }] : undefined,
      subscription_data: {
        trial_period_days: user.stripeSubscriptionId ? undefined : 14,
        metadata: { userId, plan },
      },
      metadata: { userId, plan },
      success_url: `${origin}/configuracoes?checkout=success`,
      cancel_url: `${origin}/configuracoes`,
    })

    await prisma.user.update({
      where: { id: userId },
      data: { stripeSubscriptionId: session.id },
    })

    return apiSuccess({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    const msg = error instanceof Error ? error.message : String(error)
    return apiError(`Erro ao criar sessão de checkout: ${msg}`)
  }
}
