"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Target, Percent, Users, Ban, Clock, ArrowUpRight } from "lucide-react"

interface KeyIndicatorsProps {
  indicators: {
    averageTicket: number
    completionRate: number
    cancellationRate: number
    occupationRate: number
  }
}

const items = [
  {
    key: "averageTicket" as const,
    label: "Ticket Médio",
    icon: Target,
    color: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-100 dark:bg-violet-900/30",
    textLight: "text-violet-600 dark:text-violet-400",
    format: (v: number) => formatCurrency(v),
  },
  {
    key: "completionRate" as const,
    label: "Comparecimento",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-100 dark:bg-emerald-900/30",
    textLight: "text-emerald-600 dark:text-emerald-400",
    format: (v: number) => `${v}%`,
  },
  {
    key: "cancellationRate" as const,
    label: "Cancelamento",
    icon: Ban,
    color: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-100 dark:bg-rose-900/30",
    textLight: "text-rose-600 dark:text-rose-400",
    format: (v: number) => `${v}%`,
  },
  {
    key: "occupationRate" as const,
    label: "Ocupação",
    icon: Clock,
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-100 dark:bg-blue-900/30",
    textLight: "text-blue-600 dark:text-blue-400",
    format: (v: number) => `${v}%`,
  },
]

export function KeyIndicators({ indicators }: KeyIndicatorsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const value = indicators[item.key]
        return (
          <Card key={item.key} className="group relative overflow-hidden card-hover">
            <div className={cn("absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500", item.color.replace("from-", "bg-gradient-to-br from-"))} />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3",
                  item.color
                )}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                  </p>
                  <p className="text-xl font-bold tracking-tight">{item.format(value)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
