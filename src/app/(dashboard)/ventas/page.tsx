"use client"

import { useState, useEffect, useMemo } from "react"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

interface Venta {
  id: string
  createdAt: string
  total: number
  descuento: number
  metodoPago: string
  cliente: { nombre: string } | null
  detalles: {
    id: string
    cantidad: number
    variante: { producto: { nombre: string; sku: string } }
  }[]
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroMes, setFiltroMes] = useState("")

  useEffect(() => {
    fetch("/api/ventas")
      .then((r) => r.json())
      .then((data) => { setVentas(data); setLoading(false) })
  }, [])

  const mesesDisponibles = useMemo(() => [
    ...new Set(ventas.map((v) => (v.createdAt as string).slice(0, 7)))
  ].sort().reverse(), [ventas])

  const ventasFiltradas = useMemo(() =>
    filtroMes
      ? ventas.filter((v) => (v.createdAt as string).slice(0, 7) === filtroMes)
      : ventas,
    [ventas, filtroMes]
  )

  const totalHoy = ventas
    .filter((v) => new Date(v.createdAt).toDateString() === new Date().toDateString())
    .reduce((acc, v) => acc + v.total, 0)

  const totalFiltrado = ventasFiltradas.reduce((acc, v) => acc + v.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Ventas
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {ventasFiltradas.length} ventas{filtroMes ? ` en ${new Date(filtroMes + "-02T00:00:00Z").toLocaleDateString("es-BO", { month: "long", year: "numeric" })}` : " registradas"}
          </p>
        </div>
        <Link
          href="/ventas/nueva"
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
          + Nueva venta
        </Link>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Ventas hoy</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "var(--foreground)" }}>
            Bs. {totalHoy.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {filtroMes
              ? `Total · ${new Date(filtroMes + "-02T00:00:00Z").toLocaleDateString("es-BO", { month: "long", year: "numeric" })}`
              : "Total general"}
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: "var(--foreground)" }}>
            Bs. {totalFiltrado.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filtro mes */}
      <div className="flex gap-3">
        <select
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
          style={{
            background: "var(--input)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: filtroMes ? "var(--foreground)" : "var(--muted-foreground)",
            padding: "8px 12px",
            fontSize: "14px",
            minWidth: 200,
          }}
        >
          <option value="">Todos los meses</option>
          {mesesDisponibles.map((m) => (
            <option key={m} value={m}>
              {new Date(m + "-02T00:00:00Z").toLocaleDateString("es-BO", { month: "long", year: "numeric" })}
            </option>
          ))}
        </select>
        {filtroMes && (
          <button
            onClick={() => setFiltroMes("")}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--muted-foreground)",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Fecha</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Productos</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Cliente</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Método</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Descuento</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12" style={{ color: "var(--muted-foreground)" }}>
                  Cargando...
                </td>
              </tr>
            ) : ventasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12" style={{ color: "var(--muted-foreground)" }}>
                  <ShoppingCart size={32} className="mx-auto mb-2 opacity-40" />
                  <p>No hay ventas registradas</p>
                </td>
              </tr>
            ) : (
              ventasFiltradas.map((v) => (
                <tr key={v.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(v.createdAt).toLocaleDateString("es-BO", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {v.detalles.map((d) => (
                      <div key={d.id} className="flex items-baseline gap-2">
                        <span
                          className="font-mono text-xs px-1.5 py-0.5 rounded"
                          style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                        >
                          {d.variante.producto.sku}
                        </span>
                        <span style={{ color: "var(--foreground)" }}>
                          {d.variante.producto.nombre}
                          {d.cantidad > 1 && (
                            <span style={{ color: "var(--muted-foreground)" }}> ×{d.cantidad}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {v.cliente?.nombre ?? (
                      <span className="italic" style={{ opacity: 0.5 }}>Anónimo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: v.metodoPago === "CREDITO" ? "#fef3c7" : v.metodoPago === "QR" ? "#dbeafe" : "var(--muted)",
                        color: v.metodoPago === "CREDITO" ? "#92400e" : v.metodoPago === "QR" ? "#1e40af" : "var(--muted-foreground)",
                      }}
                    >
                      {v.metodoPago}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: "var(--muted-foreground)" }}>
                    {v.descuento > 0 ? `Bs. ${v.descuento.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--foreground)" }}>
                    Bs. {v.total.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}