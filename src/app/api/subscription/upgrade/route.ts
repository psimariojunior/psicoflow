import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"

const PRICES: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_1TkpZ9KOBHid1iO0ki42h5Pb",
  clinica: process.env.STRIPE_CLINICA_PRICE_ID || "price_1TkpZ9KOBHid1iO0EDp5OoTz",
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const targetPlan = body.plan || "clinica"

  if (!PRICES[targetPlan]) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true, stripeSubscriptionId: true, stripeCustomerId: true,
      email: true, name: true,
    },
  })

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  if (user.plan === targetPlan) {
    return NextResponse.json({ error: "Você já está neste plano" }, { status: 400 })
  }

  const stripe = getStripe()

  if (user.stripeSubscriptionId && user.stripeCustomerId) {
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
      limit: 1,
    })

    const sub = subscriptions.data[0]
    if (sub) {
      const currentItem = sub.items.data[0]
      await stripe.subscriptionItems.update(currentItem.id, {
        price: PRICES[targetPlan],
        proration_behavior: "create_prorations",
      })

      await prisma.user.update({
        where: { id: session.user.id },
        data: { plan: targetPlan },
      })

      return NextResponse.json({
        ok: true,
        message: `Plano alterado para ${targetPlan}. Ajuste proporcional será cobrado no próximo faturamento.`,
      })
    }
  }

  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: session.user.id },
    })
    customerId = customer.id
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PRICES[targetPlan], quantity: 1 }],
    subscription_data: {
      metadata: { userId: session.user.id, plan: targetPlan },
    },
    metadata: { userId: session.user.id, plan: targetPlan },
    success_url: `${origin}/configuracoes?checkout=success`,
    cancel_url: `${origin}/configuracoes`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
