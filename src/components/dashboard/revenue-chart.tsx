"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { formatCurrency } from "@/lib/utils"
import { BarChart3 } from "lucide-react"
import { EmptyState } from "@/components/empty-state"

const RechartsBarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false })
const RechartsBar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false })
const RechartsXAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false })
const RechartsYAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false })
const RechartsTooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })
const RechartsResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })

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
            <RechartsResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={data}>
                <RechartsXAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsYAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} width={60} />
                <RechartsTooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Receita"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <RechartsBar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </RechartsResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon={BarChart3} title="Nenhuma receita registrada" description="A receita mensal aparecerá aqui conforme você realizar consultas." />
        )}
      </CardContent>
    </Card>
  )
}
