"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [value, "Consultas"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <Bar dataKey="appointments" fill="hsl(var(--chart-2, 142 76% 36%))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
