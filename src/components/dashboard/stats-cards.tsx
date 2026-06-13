"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, AlertTriangle, ArrowUpRight } from "lucide-react"

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
    key: "totalPatients" as const,
    label: "Pacientes Ativos",
    icon: Users,
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    textLight: "text-blue-600 dark:text-blue-400",
    changeKey: "appointmentChange" as const,
  },
  {
    key: "appointmentsToday" as const,
    label: "Consultas Hoje",
    icon: Calendar,
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-100 dark:bg-emerald-900/30",
    textLight: "text-emerald-600 dark:text-emerald-400",
    changeKey: "appointmentChange" as const,
  },
  {
    key: "monthlyRevenue" as const,
    label: "Receita do Mês",
    icon: DollarSign,
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-100 dark:bg-violet-900/30",
    textLight: "text-violet-600 dark:text-violet-400",
    changeKey: "revenueChange" as const,
    isCurrency: true,
  },
  {
    key: "pendingPayments" as const,
    label: "Pendências",
    icon: AlertTriangle,
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-100 dark:bg-amber-900/30",
    textLight: "text-amber-600 dark:text-amber-400",
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
      {cards.map((card, index) => {
        const value = stats[card.key] as number
        const change = stats[card.changeKey]
        const isPositive = change >= 0

        return (
          <Card key={card.key} className="group card-hover overflow-hidden animate-fade-in" style={{ animationDelay: `${(index + 1) * 50}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 duration-300",
                  card.bgLight,
                  card.textLight
                )}>
                  <card.icon className="h-6 w-6" />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                    isPositive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                  )}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(change)}%
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {formatValue(value, card.isCurrency)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
