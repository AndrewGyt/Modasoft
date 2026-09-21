"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface Props {
  datos: { nombre: string; total: number }[]
}

const COLORES = ["#6366F1", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"]

export default function GraficoCategorias({ datos }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={datos} layout="vertical" margin={{ left: 0, right: 0 }}>
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `Bs.${v}`}
        />
        <YAxis
          type="category"
          dataKey="nombre"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={80}
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
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {datos.map((_, i) => (
            <Cell key={i} fill={COLORES[i % COLORES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}