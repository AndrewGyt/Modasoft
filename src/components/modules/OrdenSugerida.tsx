"use client"

import { useState } from "react"
import { ShoppingBag, RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface OrdenItem {
  varianteId: string
  producto: string
  cantidadSugerida: number
  razon: string
  urgencia: "ALTA" | "MEDIA" | "BAJA"
  precioCompra: number
}

interface Orden {
  resumen: string
  ordenItems: OrdenItem[]
  totalEstimado: number
  proveedorRecomendado: string
  proveedorId: string
}

const urgenciaColor = {
  ALTA: "#EF4444",
  MEDIA: "#F59E0B",
  BAJA: "#10B981",
}

const urgenciaIcon = {
  ALTA: AlertTriangle,
  MEDIA: Clock,
  BAJA: CheckCircle,
}

export default function OrdenSugerida() {
  const [orden, setOrden] = useState<Orden | null>(null)
  const [loading, setLoading] = useState(false)
  const [creando, setCreando] = useState(false)
  const [creada, setCreada] = useState(false)

  const generarOrden = async () => {
    setLoading(true)
    setCreada(false)
    try {
      const res = await fetch("/api/ia/orden-sugerida")
      const data = await res.json()
      if (data.orden) setOrden(data.orden)
    } finally {
      setLoading(false)
    }
  }

  const crearOrden = async () => {
    if (!orden) return
    setCreando(true)
    try {
      const res = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proveedorId: orden.proveedorId,
          total: orden.totalEstimado,
          notas: `Orden generada por IA ModaSoft — ${new Date().toLocaleDateString("es-BO")}`,
          items: orden.ordenItems.map((item) => ({
            varianteId: item.varianteId,
            cantidad: item.cantidadSugerida,
            precioUnitario: item.precioCompra,
          })),
        }),
      })
      if (res.ok) setCreada(true)
    } finally {
      setCreando(false)
    }
  }

  return (
    <div
      className="rounded-xl border p-6 space-y-4"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} style={{ color: "var(--primary)" }} />
          <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
            Orden de compra sugerida
          </h2>
        </div>
        <button
          onClick={generarOrden}
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
          {loading ? "Analizando..." : orden ? "Re-analizar" : "Generar orden"}
        </button>
      </div>

      {!orden && !loading && (
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          La IA analiza tu stock actual, velocidad de ventas y lead time de proveedores para sugerirte qué pedir y en qué cantidad.
        </p>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <RefreshCw size={16} className="animate-spin" style={{ color: "var(--primary)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Analizando inventario y ventas...
          </p>
        </div>
      )}

      {orden && !loading && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {orden.resumen}
          </p>

          <div className="space-y-2">
            {orden.ordenItems.map((item, i) => {
              const Icon = urgenciaIcon[item.urgencia]
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: "var(--muted)" }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon size={16} style={{ color: urgenciaColor[item.urgencia], flexShrink: 0 }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                        {item.producto}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {item.razon}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                      x{item.cantidadSugerida}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Bs. {(item.precioCompra * item.cantidadSugerida).toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ background: "var(--muted)" }}
          >
            <div>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Proveedor recomendado
              </p>
              <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                {orden.proveedorRecomendado}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Total estimado
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                Bs. {orden.totalEstimado.toFixed(2)}
              </p>
            </div>
          </div>

          {creada ? (
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{ background: "#10B98120", color: "#10B981" }}
            >
              <CheckCircle size={16} />
              <p className="text-sm font-medium">
                Orden creada exitosamente en el módulo de Compras
              </p>
            </div>
          ) : (
            <button
              onClick={crearOrden}
              disabled={creando}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: creando ? "not-allowed" : "pointer",
                opacity: creando ? 0.7 : 1,
              }}
            >
              {creando ? "Creando orden..." : "Crear orden de compra"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}