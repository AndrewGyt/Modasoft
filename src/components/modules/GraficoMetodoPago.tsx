"use client"

interface DatoMetodo {
  metodo: string
  cantidad: number
  total: number
}

const COLORES: Record<string, string> = {
  efectivo: "#10B981",
  transferencia: "#3B82F6",
  qr: "#8B5CF6",
  tarjeta: "#F59E0B",
  otro: "#6B7280",
}

const ETIQUETAS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  qr: "QR",
  tarjeta: "Tarjeta",
  otro: "Otro",
}

export default function GraficoMetodoPago({ datos }: { datos: DatoMetodo[] }) {
  if (datos.length === 0) {
    return (
      <div className="flex items-center justify-center h-40" style={{ color: "var(--muted-foreground)" }}>
        <p className="text-sm">Sin ventas este mes</p>
      </div>
    )
  }

  const totalGeneral = datos.reduce((acc, d) => acc + d.total, 0)

  return (
    <div className="space-y-3">
      {datos
        .sort((a, b) => b.total - a.total)
        .map((d) => {
          const pct = totalGeneral > 0 ? (d.total / totalGeneral) * 100 : 0
          const color = COLORES[d.metodo] ?? COLORES.otro
          const etiqueta = ETIQUETAS[d.metodo] ?? d.metodo

          return (
            <div key={d.metodo} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ background: color }}
                  />
                  <span style={{ color: "var(--foreground)" }}>{etiqueta}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                    Bs. {d.total.toFixed(2)}
                  </span>
                  <span className="ml-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {pct.toFixed(1)}% · {d.cantidad} venta{d.cantidad !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: "var(--muted)" }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          )
        })}

      <div
        className="pt-2 mt-1 border-t flex justify-between text-sm font-semibold"
        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <span>Total</span>
        <span>Bs. {totalGeneral.toFixed(2)}</span>
      </div>
    </div>
  )
}
