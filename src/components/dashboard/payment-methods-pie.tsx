"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { CreditCard } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { formatCurrency } from "@/lib/utils"

const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"]

const METHOD_LABELS: Record<string, string> = {
  card: "Cartão",
  boleto: "Boleto",
  pix: "PIX",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
}

interface PaymentMethodsPieProps {
  data: { name: string; value: number }[]
}

export function PaymentMethodsPie({ data }: PaymentMethodsPieProps) {
  const hasData = data.some((d) => d.value > 0)

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-emerald-500" />
          Receita por Forma de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.map((d) => ({ ...d, name: METHOD_LABELS[d.name] || d.name }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) => [formatCurrency(Number(value)), "Valor"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {data.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{METHOD_LABELS[d.name] || d.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState icon={CreditCard} title="Nenhum pagamento" description="Os métodos de pagamento aparecerão aqui." />
        )}
      </CardContent>
    </Card>
  )
}
