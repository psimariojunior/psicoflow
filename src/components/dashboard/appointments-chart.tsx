"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const RechartsBarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false })
const RechartsBar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false })
const RechartsXAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false })
const RechartsYAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false })
const RechartsTooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })
const RechartsResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })

interface AppointmentsChartProps {
  data: { month: string; appointments: number }[]
}

export function AppointmentsChart({ data }: AppointmentsChartProps) {
  const hasData = data.some((d) => d.appointments > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Consultas por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-64">
            <RechartsResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={data}>
                <RechartsXAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsYAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <RechartsTooltip
                  formatter={(value) => [value, "Consultas"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <RechartsBar dataKey="appointments" fill="hsl(var(--chart-2, 142 76% 36%))" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </RechartsResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Nenhuma consulta registrada este ano
          </div>
        )}
      </CardContent>
    </Card>
  )
}
