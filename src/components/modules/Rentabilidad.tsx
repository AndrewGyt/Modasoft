"use client"

import { useState } from "react"
import { DollarSign, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"

interface Analisis {
  resumen: string
  margenGeneral: number
  categoriasMasRentables: string[]
  alertas: { tipo: string; titulo: string; descripcion: string; accion: string }[]
  recomendaciones: { titulo: string; descripcion: string; impactoEstimado: string }[]
}

interface TopProducto {
  nombre: string
  categoria: string
  gananciaReal: number
  margenReal: number
  unidadesVendidas: number
  ingresoTotal: number
}

const alertaColor: Record<string, string> = {
  CRITICO: "#EF4444",
  ADVERTENCIA: "#F59E0B",
  OPORTUNIDAD: "#10B981",
}

export default function Rentabilidad() {
  const [data, setData] = useState<{
    analisis: Analisis
    topRentables: TopProducto[]
    menosRentables: TopProducto[]
    totalIngreso: number
    totalGanancia: number
    margenGeneral: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const analizar = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ia/rentabilidad")
      const result = await res.json()
      if (result.analisis) setData(result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-xl border p-6 space-y-4"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={18} style={{ color: "#10B981" }} />
          <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
            Análisis de rentabilidad real
          </h2>
        </div>
        <button
          onClick={analizar}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: loading ? "var(--muted)" : "var(--primary)",
            color: loading ? "var(--muted-foreground)" : "var(--primary-foreground)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Analizando..." : data ? "Re-analizar" : "Analizar rentabilidad"}
        </button>
      </div>

      {!data && !loading && (
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Calcula la ganancia real por prenda considerando costo de importación, tipo de cambio y 15% de costos operativos.
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <RefreshCw size={16} className="animate-spin" style={{ color: "var(--primary)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Calculando rentabilidad real...
          </p>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg p-4" style={{ background: "var(--muted)" }}>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Ingreso total</p>
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                Bs. {data.totalIngreso.toFixed(0)}
              </p>
            </div>
            <div className="rounded-lg p-4" style={{ background: "var(--muted)" }}>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Ganancia real</p>
              <p className="text-xl font-bold" style={{ color: "#10B981" }}>
                Bs. {data.totalGanancia.toFixed(0)}
              </p>
            </div>
            <div className="rounded-lg p-4" style={{ background: "var(--muted)" }}>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Margen real</p>
              <p className="text-xl font-bold" style={{ color: "#6366F1" }}>
                {data.margenGeneral}%
              </p>
            </div>
          </div>

          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {data.analisis.resumen}
          </p>

          {data.analisis.alertas?.length > 0 && (
            <div className="space-y-2">
              {data.analisis.alertas.map((a, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border-l-4"
                  style={{
                    background: alertaColor[a.tipo] + "10",
                    borderLeftColor: alertaColor[a.tipo],
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: alertaColor[a.tipo] + "20", color: alertaColor[a.tipo] }}
                    >
                      {a.tipo}
                    </span>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {a.titulo}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{a.descripcion}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: alertaColor[a.tipo] }}>
                    → {a.accion}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                <TrendingUp size={12} style={{ color: "#10B981" }} /> TOP MÁS RENTABLES
              </p>
              <div className="space-y-1">
                {data.topRentables.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <p className="text-xs truncate flex-1" style={{ color: "var(--foreground)" }}>
                      {p.nombre}
                    </p>
                    <div className="text-right ml-2">
                      <p className="text-xs font-bold" style={{ color: "#10B981" }}>
                        {p.margenReal}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                <TrendingDown size={12} style={{ color: "#EF4444" }} /> MENOS RENTABLES
              </p>
              <div className="space-y-1">
                {data.menosRentables.map((p, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <p className="text-xs truncate flex-1" style={{ color: "var(--foreground)" }}>
                      {p.nombre}
                    </p>
                    <div className="text-right ml-2">
                      <p className="text-xs font-bold" style={{ color: "#EF4444" }}>
                        {p.margenReal}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {data.analisis.recomendaciones?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
                RECOMENDACIONES
              </p>
              {data.analisis.recomendaciones.map((r, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg"
                  style={{ background: "var(--muted)" }}
                >
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {r.titulo}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    {r.descripcion}
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: "#6366F1" }}>
                    Impacto: {r.impactoEstimado}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}