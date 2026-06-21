#!/usr/bin/env node
/**
 * Stripe Products Setup Script
 * Run: node scripts/setup-stripe-plans.mjs <STRIPE_SECRET_KEY>
 * 
 * Creates:
 * - PsicoFlow Pro plan (R$97/month)
 * - PsicoFlow Clínica plan (R$197/month)
 * - Outputs Price IDs to paste in create-checkout/route.ts
 */

import Stripe from "stripe"

const key = process.argv[2]
if (!key) {
  console.error("Usage: node scripts/setup-stripe-plans.mjs <STRIPE_SECRET_KEY>")
  process.exit(1)
}

const stripe = new Stripe(key)

async function setup() {
  console.log("Creating PsicoFlow products...\n")

  // Pro Plan
  const proProduct = await stripe.products.create({
    name: "PsicoFlow Pro",
    description: "Gestão completa para psicólogos. Prontuários, agenda, videochamada, relatórios.",
    metadata: { plan: "pro" },
  })
  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 9700, // R$97
    currency: "brl",
    recurring: { interval: "month" },
    metadata: { plan: "pro" },
  })
  console.log(`✅ Pro Plan: ${proPrice.id}`)

  // Clínica Plan
  const clinicProduct = await stripe.products.create({
    name: "PsicoFlow Clínica",
    description: "Para clínicas com múltiplos profissionais. Tudo do Pro + relatórios avançados.",
    metadata: { plan: "clinica" },
  })
  const clinicPrice = await stripe.prices.create({
    product: clinicProduct.id,
    unit_amount: 19700, // R$197
    currency: "brl",
    recurring: { interval: "month" },
    metadata: { plan: "clinica" },
  })
  console.log(`✅ Clínica Plan: ${clinicPrice.id}`)

  console.log("\n--- PASTE THESE IN src/app/api/subscription/create-checkout/route.ts ---")
  console.log(`pro: "${proPrice.id}",`)
  console.log(`clinica: "${clinicPrice.id}",`)
  console.log("-----------------------------------------------------------------------\n")

  // Create webhook endpoint
  console.log("Next steps:")
  console.log("1. Go to https://dashboard.stripe.com/webhooks")
  console.log("2. Add endpoint: https://psicoflow-iota.vercel.app/api/pagamentos/webhook")
  console.log("3. Select events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.paid, invoice.payment_failed")
  console.log("4. Copy the signing secret to STRIPE_WEBHOOK_SECRET in Vercel")
}

setup().catch(console.error)
