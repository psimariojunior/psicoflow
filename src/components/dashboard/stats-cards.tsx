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
    color: "from-blue-500 to-blue-700",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    textLight: "text-blue-600 dark:text-blue-400",
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
  },
  {
    key: "pendingPayments" as const,
    label: "Pendentes",
    icon: AlertTriangle,
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-100 dark:bg-amber-900/30",
    textLight: "text-amber-600 dark:text-amber-400",
    changeKey: "revenueChange" as const,
  },
]

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const value = stats[card.key]
        const change = stats[card.changeKey]
        const isPositive = change >= 0

        return (
          <Card key={card.key} className="group relative overflow-hidden card-hover border-0 bg-gradient-to-br from-card to-muted/30">
            <div className={cn("absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500", card.color.replace("from-", "bg-gradient-to-br from-"))} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {card.key === "monthlyRevenue" || card.key === "pendingPayments"
                      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
                      : value}
                  </p>
                </div>
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                  card.color
                )}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className={isPositive ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}>
                  {isPositive ? "+" : ""}{change}%
                </span>
                <span className="text-muted-foreground ml-1">vs. mês anterior</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
