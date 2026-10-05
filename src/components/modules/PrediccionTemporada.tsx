"use client"

import { useState } from "react"
import { TrendingUp, RefreshCw, Calendar } from "lucide-react"

interface PrediccionMes {
  mes: string
  categoriaEstrella: string
  ventasEstimadas: number
  tendencia: "CRECIENTE" | "ESTABLE" | "DECRECIENTE"
  recomendacion: string
  categorias: { nombre: string; prediccion: "SUBE" | "ESTABLE" | "BAJA"; razon: string }[]
}

interface Prediccion {
  resumen: string
  predicciones: PrediccionMes[]
  alertaTemporada: string
  accionInmediata: string
}

const tendenciaColor = {
  CRECIENTE: "#10B981",
  ESTABLE: "#F59E0B",
  DECRECIENTE: "#EF4444",
}

const prediccionColor = {
  SUBE: "#10B981",
  ESTABLE: "#F59E0B",
  BAJA: "#EF4444",
}

export default function PrediccionTemporada() {
  const [prediccion, setPrediccion] = useState<Prediccion | null>(null)
  const [loading, setLoading] = useState(false)

  const analizar = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ia/prediccion-temporada")
      const data = await res.json()
      if (data.prediccion) setPrediccion(data.prediccion)
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
          <Calendar size={18} style={{ color: "#6366F1" }} />
          <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
            Predicción de temporada
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
          {loading ? "Prediciendo..." : prediccion ? "Re-predecir" : "Predecir temporada"}
        </button>
      </div>

      {!prediccion && !loading && (
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Analiza patrones estacionales de Bolivia para predecir qué categorías van a subir los próximos 3 meses.
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <RefreshCw size={16} className="animate-spin" style={{ color: "var(--primary)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Analizando patrones estacionales...
          </p>
        </div>
      )}

      {prediccion && !loading && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {prediccion.resumen}
          </p>

          <div
            className="p-3 rounded-lg"
            style={{ background: "#6366F120", borderLeft: "3px solid #6366F1" }}
          >
            <p className="text-xs font-semibold" style={{ color: "#6366F1" }}>
              ACCIÓN INMEDIATA
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--foreground)" }}>
              {prediccion.accionInmediata}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {prediccion.predicciones.map((p, i) => (
              <div
                key={i}
                className="rounded-lg p-4 space-y-3"
                style={{ background: "var(--muted)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                    {p.mes}
                  </p>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: tendenciaColor[p.tendencia] + "20",
                      color: tendenciaColor[p.tendencia],
                    }}
                  >
                    {p.tendencia}
                  </span>
                </div>

                <div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Categoría estrella
                  </p>
                  <p className="text-sm font-medium" style={{ color: "#6366F1" }}>
                    {p.categoriaEstrella}
                  </p>
                </div>

                <div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Ventas estimadas
                  </p>
                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                    Bs. {p.ventasEstimadas.toFixed(0)}
                  </p>
                </div>

                <div className="space-y-1">
                  {p.categorias?.slice(0, 3).map((cat, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                        {cat.nombre}
                      </p>
                      <span
                        className="text-xs font-bold ml-2"
                        style={{ color: prediccionColor[cat.prediccion] }}
                      >
                        {cat.prediccion}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs italic" style={{ color: "var(--muted-foreground)" }}>
                  {p.recomendacion}
                </p>
              </div>
            ))}
          </div>

          <div
            className="p-3 rounded-lg"
            style={{ background: "#F59E0B20", borderLeft: "3px solid #F59E0B" }}
          >
            <p className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
              ALERTA DE TEMPORADA
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--foreground)" }}>
              {prediccion.alertaTemporada}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}