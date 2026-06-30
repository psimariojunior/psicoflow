"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  balance: number
  pending: number
  overdue: number
  received: number
  goal?: number
}

export function FinancialSummaryCard({ summary }: { summary: FinancialSummary }) {
  const progressGoal = summary.goal ? (summary.received / summary.goal) * 100 : 0

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Resumo Financeiro</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-teal-50 dark:bg-teal-950/30 p-3">
            <p className="text-xs text-muted-foreground">Receitas</p>
            <p className="text-lg font-bold text-teal-600">
              {formatCurrency(summary.totalRevenue)}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3">
            <p className="text-xs text-muted-foreground">Despesas</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(summary.totalExpenses)}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-primary/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Saldo</p>
            <span className={summary.balance >= 0 ? "text-teal-600" : "text-red-600"}>
              {summary.balance >= 0 ? (
                <TrendingUp className="inline h-4 w-4" />
              ) : (
                <TrendingDown className="inline h-4 w-4" />
              )}
            </span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(summary.balance)}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Meta do mês</span>
            <span className="font-medium">{progressGoal.toFixed(0)}%</span>
          </div>
          <Progress value={Math.min(progressGoal, 100)} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-muted-foreground">Recebido</p>
            <p className="font-medium text-teal-600">{formatCurrency(summary.received)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pendente</p>
            <p className="font-medium text-amber-600">{formatCurrency(summary.pending)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vencido</p>
            <p className="font-medium text-red-600">{formatCurrency(summary.overdue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
