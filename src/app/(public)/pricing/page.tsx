"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Building2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    id: "pro" as const,
    name: "Pro",
    price: "R$ 97",
    period: "/mês",
    description: "Para profissionais individuais que querem escalar",
    icon: Zap,
    features: [
      "Até 200 pacientes",
      "Consultas ilimitadas",
      "Videochamada integrada",
      "IA para prontuários",
      "Relatórios avançados",
      "Lembretes automáticos",
      "Suporte prioritário",
    ],
    popular: true,
  },
  {
    id: "clinica" as const,
    name: "Clínica",
    price: "R$ 197",
    period: "/mês",
    description: "Para clínicas e equipes com múltiplos profissionais",
    icon: Building2,
    features: [
      "Pacientes ilimitados",
      "Consultas ilimitadas",
      "Videochamada integrada",
      "IA para prontuários",
      "Relatórios avançados",
      "Lembretes automáticos",
      "Gerenciar equipe",
      "Suporte dedicado",
    ],
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (plan: "pro" | "clinica") => {
    setLoading(plan)
    try {
      const res = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || "Erro ao criar sessão de checkout")
      }
    } catch {
      alert("Erro ao conectar com o servidor")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-emerald-50/30 dark:to-emerald-950/10">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>

          <div className="text-center space-y-4">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              14 dias grátis
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">
              Escolha o plano ideal para você
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comece gratuitamente e evolua conforme sua prática cresce.
              Sem compromisso, cancele quando quiser.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-emerald-500 dark:border-emerald-400 shadow-lg shadow-emerald-500/10"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Mais popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full ${plan.popular ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loading !== null}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {loading === plan.id ? "Redirecionando..." : "Começar agora"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem 14 dias de trial gratuito. Não é necessário cartão de crédito para começar.
          </p>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Sem cancelamento de contrato</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Suporte via chat</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Dados seguros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
