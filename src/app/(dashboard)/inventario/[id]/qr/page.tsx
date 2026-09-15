"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import QRCode from "react-qr-code"

interface Producto {
  id: string
  nombre: string
  sku: string
  marca: string | null
  precioVenta: number
  temporada: string | null
  categoria: { nombre: string }
  variantes: { id: string; talla: string; color: string; stockActual: number }[]
}

export default function QRProductoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [producto, setProducto] = useState<Producto | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!params?.id) return
    fetch(`/api/productos/${params.id}`)
      .then((r) => r.json())
      .then(setProducto)
  }, [params?.id])

  const handleImprimir = () => {
    window.print()
  }

  if (!producto) {
    return (
      <div style={{ color: "var(--muted-foreground)", padding: "40px" }}>
        Cargando...
      </div>
    )
  }

  const qrData = JSON.stringify({
    sku: producto.sku,
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precioVenta,
  })

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Código QR
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {producto.nombre}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/inventario")}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Volver
          </button>
          <button
            onClick={handleImprimir}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Imprimir
          </button>
        </div>
      </div>

      <div ref={printRef} className="space-y-4">
        {producto.variantes.map((v) => (
          <div
            key={v.id}
            className="rounded-xl border p-6 flex gap-6 items-center"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div
              className="p-3 rounded-lg"
              style={{ background: "white" }}
            >
              <QRCode
                value={JSON.stringify({
                  sku: producto.sku,
                  id: producto.id,
                  varianteId: v.id,
                  nombre: producto.nombre,
                  talla: v.talla,
                  color: v.color,
                  precio: producto.precioVenta,
                })}
                size={120}
              />
            </div>

            <div className="space-y-1">
              <p className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
                {producto.nombre}
              </p>
              {producto.marca && (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Marca: {producto.marca}
                </p>
              )}
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                SKU: <span className="font-mono font-medium">{producto.sku}</span>
              </p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Talla: {v.talla} · Color: {v.color}
              </p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Categoría: {producto.categoria.nombre}
              </p>
              <p className="font-bold text-lg mt-2" style={{ color: "var(--foreground)" }}>
                Bs. {producto.precioVenta.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; }
        }
      `}</style>
    </div>
  )
}