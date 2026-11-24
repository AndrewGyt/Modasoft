"use client"

import { useState } from "react"
import { Package, AlertTriangle, Search, X } from "lucide-react"
import Link from "next/link"

interface Variante {
  id: string
  talla: string
  color: string
  stockActual: number
  stockMinimo: number
  estado: string
  producto: {
    id: string
    nombre: string
    sku: string
    precioVenta: number
    categoria: { nombre: string }
  }
}

interface Props {
  variantes: Variante[]
}

export default function InventarioClient({ variantes }: Props) {
  const [busqueda, setBusqueda] = useState("")
  const [alertaDismissed, setAlertaDismissed] = useState(false)

  const variantesActivas = variantes.filter((v) => v.estado !== "BAJA")
  const stockBajo = variantesActivas.filter((v) => v.stockActual <= v.stockMinimo)

  const variantesFiltradas = variantes.filter((v) => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (
      v.producto.nombre.toLowerCase().includes(q) ||
      v.producto.sku.toLowerCase().includes(q) ||
      v.producto.categoria.nombre.toLowerCase().includes(q) ||
      v.talla.toLowerCase().includes(q) ||
      v.color.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Inventario
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {variantesActivas.length} variantes activas
            {variantes.length > variantesActivas.length && (
              <span style={{ color: "var(--muted-foreground)", marginLeft: 6 }}>
                · {variantes.length - variantesActivas.length} dadas de baja
              </span>
            )}
          </p>
        </div>
        <Link
          href="/inventario/nuevo"
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
          + Nuevo producto
        </Link>
      </div>

      {/* Alerta stock bajo (con X para cerrar) */}
      {stockBajo.length > 0 && !alertaDismissed && (
        <div
          className="flex items-center justify-between gap-3 p-4 rounded-lg border"
          style={{ background: "var(--destructive)", borderColor: "var(--destructive)" }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} color="white" />
            <p className="text-sm font-medium text-white">
              {stockBajo.length} producto(s) con stock bajo:{" "}
              {stockBajo.slice(0, 3).map((v) => v.producto.nombre).join(", ")}
              {stockBajo.length > 3 && ` y ${stockBajo.length - 3} más`}
            </p>
          </div>
          <button
            onClick={() => setAlertaDismissed(true)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "2px",
              display: "flex",
              alignItems: "center",
              color: "white",
              opacity: 0.8,
            }}
            aria-label="Cerrar aviso"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Buscador */}
      <div
        className="flex items-center gap-2 px-3 rounded-lg border"
        style={{
          background: "var(--input)",
          borderColor: "var(--border)",
        }}
      >
        <Search size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Buscar por nombre, SKU, categoría, talla o color..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: "var(--foreground)",
            padding: "10px 0",
            width: "100%",
          }}
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}
          >
            <X size={14} style={{ color: "var(--muted-foreground)" }} />
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
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Producto</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>SKU</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Categoría</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Talla</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Color</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Stock</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Mínimo</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Precio venta</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Estado</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {variantesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12" style={{ color: "var(--muted-foreground)" }}>
                  <Package size={32} className="mx-auto mb-2 opacity-40" />
                  <p>{busqueda ? `Sin resultados para "${busqueda}"` : "No hay productos en inventario"}</p>
                </td>
              </tr>
            ) : (
              variantesFiltradas.map((v) => {
                const esBaja = v.estado === "BAJA"
                const bajo = !esBaja && v.stockActual <= v.stockMinimo
                return (
                  <tr
                    key={v.id}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--border)", opacity: esBaja ? 0.5 : 1 }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                      {v.producto.nombre}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {v.producto.sku}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                      {v.producto.categoria.nombre}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                      {v.talla}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                      {v.color}
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--foreground)" }}>
                      {v.stockActual}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: "var(--muted-foreground)" }}>
                      {v.stockMinimo}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: "var(--foreground)" }}>
                      Bs. {v.producto.precioVenta.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: esBaja ? "#78716c" : bajo ? "var(--destructive)" : "var(--primary)",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        {esBaja ? "BAJA" : bajo ? "Stock bajo" : "OK"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-3 justify-end">
                        <Link
                          href={`/inventario/${v.producto.id}/qr`}
                          style={{
                            fontSize: "13px",
                            color: "var(--muted-foreground)",
                            textDecoration: "none",
                            fontWeight: 500,
                          }}
                        >
                          QR
                        </Link>
                        <Link
                          href={`/inventario/${v.producto.id}/editar`}
                          style={{
                            fontSize: "13px",
                            color: "var(--primary)",
                            textDecoration: "none",
                            fontWeight: 500,
                          }}
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {variantesFiltradas.length > 0 && busqueda && (
        <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
          {variantesFiltradas.length} resultado(s) para &quot;{busqueda}&quot;
        </p>
      )}
    </div>
  )
}
