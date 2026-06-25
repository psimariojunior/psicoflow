"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const data = [
  { name: "Free", value: 0, fill: "#94a3b8" },
  { name: "Trial", value: 0, fill: "#f59e0b" },
  { name: "Pro", value: 97, fill: "#3b82f6" },
  { name: "Clínica", value: 197, fill: "#8b5cf6" },
]

export default function AdminMRRChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${v}`} />
          <Tooltip
            contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
            formatter={(v: any) => [`R$ ${v}/mês`, "Valor"]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
