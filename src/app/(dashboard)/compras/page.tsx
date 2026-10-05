"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Package } from "lucide-react"

interface Orden {
  id: string
  estado: string
  total: number
  createdAt: string
  fechaEsperada: string | null
  notas: string | null
  proveedor: { nombre: string }
  detalles: {
    id: string
    cantidad: number
    precioUnitario: number
    variante: { talla: string; color: string; producto: { nombre: string } }
  }[]
}

const estadoColor: Record<string, string> = {
  PENDIENTE: "#F59E0B",
  ENVIADA: "#3B82F6",
  RECIBIDA: "#10B981",
  CANCELADA: "#EF4444",
}

export default function ComprasPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/compras")
      .then((r) => r.json())
      .then((data) => { setOrdenes(data); setLoading(false) })
  }, [])

  const actualizarEstado = async (id: string, estado: string) => {
    await fetch(`/api/compras/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    })
    setOrdenes(ordenes.map((o) => o.id === id ? { ...o, estado } : o))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Órdenes de compra
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {ordenes.length} órdenes registradas
          </p>
        </div>
        <Link
          href="/compras/nueva"
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          + Nueva orden
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted-foreground)" }}>Cargando...</p>
      ) : ordenes.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <Package size={32} className="mx-auto mb-2 opacity-40" style={{ color: "var(--muted-foreground)" }} />
          <p style={{ color: "var(--muted-foreground)" }}>No hay órdenes de compra</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ordenes.map((orden) => (
            <div
              key={orden.id}
              className="rounded-xl border p-5 space-y-3"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                    {orden.proveedor.nombre}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(orden.createdAt).toLocaleDateString("es-BO")}
                    {orden.fechaEsperada && ` · Entrega: ${new Date(orden.fechaEsperada).toLocaleDateString("es-BO")}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: estadoColor[orden.estado] + "20", color: estadoColor[orden.estado] }}
                  >
                    {orden.estado}
                  </span>
                  <p className="font-bold" style={{ color: "var(--foreground)" }}>
                    Bs. {orden.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                {orden.detalles.map((d) => (
                  <p key={d.id} className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {d.variante.producto.nombre} · {d.variante.talla} {d.variante.color} · x{d.cantidad} · Bs. {d.precioUnitario.toFixed(2)}
                  </p>
                ))}
              </div>

              {orden.notas && (
                <p className="text-xs italic" style={{ color: "var(--muted-foreground)" }}>
                  {orden.notas}
                </p>
              )}

              {orden.estado !== "RECIBIDA" && orden.estado !== "CANCELADA" && (
                <div className="flex gap-2 pt-1">
                  {orden.estado === "PENDIENTE" && (
                    <button
                      onClick={() => actualizarEstado(orden.id, "ENVIADA")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #3B82F6",
                        background: "transparent",
                        color: "#3B82F6",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Marcar como enviada
                    </button>
                  )}
                  {orden.estado === "ENVIADA" && (
                    <button
                      onClick={() => actualizarEstado(orden.id, "RECIBIDA")}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #10B981",
                        background: "transparent",
                        color: "#10B981",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Marcar como recibida
                    </button>
                  )}
                  <button
                    onClick={() => actualizarEstado(orden.id, "CANCELADA")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--destructive)",
                      background: "transparent",
                      color: "var(--destructive)",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}