"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { BarChart3 } from "lucide-react"
import { EmptyState } from "@/components/empty-state"

interface RevenueChartProps {
  data: { month: string; receita: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasData = data.some((d) => d.receita > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} width={60} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Receita"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon={BarChart3} title="Nenhuma receita registrada" description="A receita mensal aparecerá aqui conforme você realizar consultas." />
        )}
      </CardContent>
    </Card>
  )
}
