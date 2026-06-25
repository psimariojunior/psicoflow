import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe"
import type Stripe from "stripe"

export const dynamic = "force-dynamic"

function getSubPeriodStart(sub: Stripe.Subscription): number | null {
  const item = sub.items.data[0]
  return item?.current_period_start ?? null
}

function getSubPeriodEnd(sub: Stripe.Subscription): number | null {
  const item = sub.items.data[0]
  return item?.current_period_end ?? null
}

async function grantReferralReward(referredUserId: string) {
  const referral = await prisma.referral.findUnique({
    where: { referredId: referredUserId },
    select: { id: true, referrerId: true, rewardGranted: true },
  })

  if (!referral || referral.rewardGranted) return

  const referrer = await prisma.user.findUnique({
    where: { id: referral.referrerId },
    select: { planExpiresAt: true },
  })

  const base = referrer?.planExpiresAt && referrer.planExpiresAt > new Date()
    ? referrer.planExpiresAt
    : new Date()
  const newExpiry = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: referral.referrerId },
      data: { planExpiresAt: newExpiry },
    }),
    prisma.referral.update({
      where: { id: referral.id },
      data: { rewardGranted: true },
    }),
  ])
}

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

      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription
        const subUserId = sub.metadata?.userId
        const subPlan = sub.metadata?.plan || "pro"
        const periodStart = getSubPeriodStart(sub)
        const periodEnd = getSubPeriodEnd(sub)

        if (subUserId) {
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: sub.id },
            create: {
              userId: subUserId,
              stripeSubscriptionId: sub.id,
              stripePriceId: typeof sub.items.data[0]?.price?.id === "string" ? sub.items.data[0].price.id : null,
              plan: subPlan,
              status: sub.status === "trialing" ? "trialing" : "active",
              currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
              currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
            update: {
              status: sub.status === "trialing" ? "trialing" : "active",
              currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
              currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
            },
          })

          await prisma.user.update({
            where: { id: subUserId },
            data: {
              plan: subPlan,
              subscriptionStatus: sub.status === "trialing" ? "trialing" : "active",
              stripeSubscriptionId: sub.id,
              planExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
            },
          })

          if (sub.status === "active") await grantReferralReward(subUserId)
        }
        break
      }

      case "customer.subscription.updated": {
        const updatedSub = event.data.object as Stripe.Subscription
        const updatedUserId = updatedSub.metadata?.userId

        const subRecord = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: updatedSub.id },
          select: { userId: true },
        })
        const targetUserId = updatedUserId || subRecord?.userId

        if (targetUserId) {
          const newStatus = updatedSub.status === "trialing" ? "trialing"
            : updatedSub.status === "active" ? "active"
            : updatedSub.status === "canceled" ? "cancelled"
            : "past_due"

          const periodStart = getSubPeriodStart(updatedSub)
          const periodEnd = getSubPeriodEnd(updatedSub)

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: updatedSub.id },
            data: {
              status: newStatus,
              currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
              currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
              cancelAtPeriodEnd: updatedSub.cancel_at_period_end,
            },
          })

          const planForUser = updatedSub.metadata?.plan || "pro"
          await prisma.user.update({
            where: { id: targetUserId },
            data: {
              plan: updatedSub.status === "canceled" ? "free" : planForUser,
              subscriptionStatus: newStatus,
              planExpiresAt: periodEnd ? new Date(periodEnd * 1000) : null,
            },
          })

          if (updatedSub.status === "active") await grantReferralReward(targetUserId)
        }
        break
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as Stripe.Subscription
        const deletedSubRecord = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: deletedSub.id },
          select: { userId: true },
        })

        if (deletedSubRecord) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: deletedSub.id },
            data: { status: "cancelled" },
          })

          await prisma.user.update({
            where: { id: deletedSubRecord.userId },
            data: {
              plan: "free",
              subscriptionStatus: "cancelled",
              stripeSubscriptionId: null,
              planExpiresAt: null,
            },
          })
        }
        break
      }

      case "invoice.paid": {
        const paidInvoice = event.data.object as Stripe.Invoice
        const paidSub = paidInvoice.parent?.subscription_details?.subscription
        const subId = paidSub
          ? (typeof paidSub === "string" ? paidSub : paidSub.id)
          : null

        if (subId) {
          const invSub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subId },
            select: { userId: true },
          })

          if (invSub && paidInvoice.period_end) {
            await prisma.subscription.updateMany({
              where: { stripeSubscriptionId: subId },
              data: {
                currentPeriodEnd: new Date(paidInvoice.period_end * 1000),
                status: "active",
              },
            })

            await prisma.user.update({
              where: { id: invSub.userId },
              data: {
                subscriptionStatus: "active",
                planExpiresAt: new Date(paidInvoice.period_end * 1000),
              },
            })

            await grantReferralReward(invSub.userId)
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object as Stripe.Invoice
        const failedSubRef = failedInvoice.parent?.subscription_details?.subscription
        const failSubId = failedSubRef
          ? (typeof failedSubRef === "string" ? failedSubRef : failedSubRef.id)
          : null

        if (failSubId) {
          const failSub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: failSubId },
            select: { userId: true },
          })

          if (failSub) {
            await prisma.subscription.updateMany({
              where: { stripeSubscriptionId: failSubId },
              data: { status: "past_due" },
            })

            await prisma.user.update({
              where: { id: failSub.userId },
              data: { subscriptionStatus: "past_due" },
            })

            console.warn(`[Stripe Webhook] Payment failed for subscription ${failSubId}, user ${failSub.userId}`)
          }
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
