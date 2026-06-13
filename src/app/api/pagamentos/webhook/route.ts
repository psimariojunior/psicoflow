import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Webhook signature missing" }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = getStripe().webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const invoiceId = session.metadata?.invoiceId
        const psychologistId = session.metadata?.psychologistId

        if (invoiceId && psychologistId) {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "PAID",
              paidDate: new Date(),
              paymentMethod: "card",
              stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
              stripeCheckoutSessionId: session.id,
            },
          })

          await prisma.financialTransaction.create({
            data: {
              description: "Pagamento recebido via Stripe",
              type: "INCOME",
              amount: session.amount_total ? session.amount_total / 100 : 0,
              paymentMethod: "card",
              paymentDate: new Date(),
              paymentStatus: "PAID",
              invoiceId,
              psychologistId,
            },
          })
        }
        break
      }

      case "checkout.session.expired": {
        const expiredSession = event.data.object as Stripe.Checkout.Session
        const expiredInvoiceId = expiredSession.metadata?.invoiceId

        if (expiredInvoiceId) {
          await prisma.invoice.update({
            where: { id: expiredInvoiceId },
            data: {
              status: "OVERDUE",
              stripeCheckoutSessionId: null,
            },
          })
        }
        break
      }

      case "payment_intent.payment_failed": {
        const failedIntent = event.data.object as Stripe.PaymentIntent
        const failedInvoiceId = failedIntent.metadata?.invoiceId

        if (failedInvoiceId) {
          await prisma.invoice.update({
            where: { id: failedInvoiceId },
            data: { status: "OVERDUE" },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error("Stripe webhook error", { error: String(error) })
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
