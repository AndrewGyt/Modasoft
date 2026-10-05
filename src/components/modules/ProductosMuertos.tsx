"use client"

import { useState } from "react"
import { PackageX, RefreshCw, Tag } from "lucide-react"

interface ProductoMuerto {
  varianteId: string
  producto: string
  estrategia: "DESCUENTO" | "COMBO" | "SHOWCASE" | "DEVOLVER"
  descuentoSugerido: number
  precioSugerido: number
  razon: string
  urgencia: "ALTA" | "MEDIA" | "BAJA"
}

interface Analisis {
  resumen: string
  productos: ProductoMuerto[]
  capitalInmovilizado: number
  accionPrioritaria: string
}

const estrategiaColor = {
  DESCUENTO: "#EF4444",
  COMBO: "#6366F1",
  SHOWCASE: "#F59E0B",
  DEVOLVER: "#10B981",
}

const urgenciaColor = {
  ALTA: "#EF4444",
  MEDIA: "#F59E0B",
  BAJA: "#10B981",
}

export default function ProductosMuertos() {
  const [analisis, setAnalisis] = useState<Analisis | null>(null)
  const [loading, setLoading] = useState(false)

  const analizar = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ia/productos-muertos")
      const data = await res.json()
      if (data.analisis) setAnalisis(data.analisis)
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
          <PackageX size={18} style={{ color: "#EF4444" }} />
          <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
            Detector de productos sin movimiento
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
          {loading ? "Analizando..." : analisis ? "Re-analizar" : "Detectar"}
        </button>
      </div>

      {!analisis && !loading && (
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Identifica prendas sin ventas en los últimos 90 días y recibe estrategias de liquidación con precios sugeridos.
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <RefreshCw size={16} className="animate-spin" style={{ color: "var(--primary)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Detectando productos sin movimiento...
          </p>
        </div>
      )}

      {analisis && !loading && (
        <div className="space-y-4">
          <div
            className="p-3 rounded-lg"
            style={{ background: "#EF444420", borderLeft: "3px solid #EF4444" }}
          >
            <p className="text-sm font-medium" style={{ color: "#EF4444" }}>
              Capital inmovilizado: Bs. {analisis.capitalInmovilizado.toFixed(2)}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              {analisis.accionPrioritaria}
            </p>
          </div>

          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {analisis.resumen}
          </p>

          <div className="space-y-2">
            {analisis.productos.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "var(--muted)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: estrategiaColor[p.estrategia] + "20",
                        color: estrategiaColor[p.estrategia],
                      }}
                    >
                      {p.estrategia}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: urgenciaColor[p.urgencia] + "20",
                        color: urgenciaColor[p.urgencia],
                      }}
                    >
                      {p.urgencia}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                    {p.producto}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {p.razon}
                  </p>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Tag size={12} style={{ color: "#10B981" }} />
                    <p className="text-sm font-bold" style={{ color: "#10B981" }}>
                      Bs. {p.precioSugerido.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    -{p.descuentoSugerido}% descuento
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}