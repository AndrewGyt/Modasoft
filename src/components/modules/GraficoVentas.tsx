"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface Props {
  datos: { dia: string; total: number }[]
}

export default function GraficoVentas({ datos }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={datos} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="dia"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `Bs.${v}`}
        />
        <Tooltip
          formatter={(value: number) => [`Bs. ${value.toFixed(2)}`, "Ventas"]}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}