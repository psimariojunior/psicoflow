"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalPatients: number
    appointmentsToday: number
    monthlyRevenue: number
    pendingPayments: number
    appointmentChange: number
    revenueChange: number
  }
}

const cards = [
  {
    key: "totalPatients",
    label: "Pacientes Ativos",
    icon: "👥",
    changeKey: "appointmentChange" as const,
  },
  {
    key: "appointmentsToday",
    label: "Consultas Hoje",
    icon: "📅",
    changeKey: "appointmentChange" as const,
  },
  {
    key: "monthlyRevenue",
    label: "Receita do Mês",
    icon: "💰",
    changeKey: "revenueChange" as const,
    isCurrency: true,
  },
  {
    key: "pendingPayments",
    label: "Pendências Financeiras",
    icon: "⚠️",
    changeKey: "revenueChange" as const,
    isCurrency: true,
  },
]

export function StatsCards({ stats }: StatsCardsProps) {
  const formatValue = (value: number, isCurrency?: boolean) => {
    if (isCurrency) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value)
    }
    return value.toString()
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const value = stats[card.key as keyof typeof stats] as number
        const change = stats[card.changeKey]
        const isPositive = change >= 0

        return (
          <Card key={card.key} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{card.icon}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    isPositive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(change)}%
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold">
                {formatValue(value, card.isCurrency)}
              </p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
