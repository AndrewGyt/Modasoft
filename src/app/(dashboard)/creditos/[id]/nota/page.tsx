"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface DetalleVenta {
  id: string
  cantidad: number
  precioUnitario: number
  variante: {
    talla: string
    color: string
    producto: { nombre: string; sku: string }
  }
}

interface PagoCredito {
  id: string
  monto: number
  metodoPago: string
  createdAt: string
}

interface CreditoDetalle {
  id: string
  montoTotal: number
  montoPagado: number
  fechaVencimiento: string
  estado: string
  notas: string | null
  createdAt: string
  cliente: { nombre: string; telefono: string | null; email: string | null }
  venta: { id: string; createdAt: string; detalles: DetalleVenta[] }
  pagos: PagoCredito[]
}

export default function NotaCreditoPage() {
  const params = useParams<{ id: string }>()
  const [credito, setCredito] = useState<CreditoDetalle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    fetch(`/api/creditos/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setCredito(data); setLoading(false) })
  }, [params?.id])

  if (loading || !credito) {
    return (
      <div style={{ padding: 40, color: "#666" }}>
        {loading ? "Cargando nota de crédito..." : "Crédito no encontrado."}
      </div>
    )
  }

  const saldo = credito.montoTotal - credito.montoPagado
  const fechaEmision = new Date(credito.venta.createdAt).toLocaleDateString("es-BO", {
    day: "2-digit", month: "long", year: "numeric",
  })
  const fechaVence = new Date(credito.fechaVencimiento).toLocaleDateString("es-BO", {
    day: "2-digit", month: "long", year: "numeric",
  })

  return (
    <>
      {/* Botón imprimir — oculto al imprimir */}
      <div className="no-print" style={{ padding: "16px 24px", display: "flex", gap: 12 }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "none",
            background: "#1a1a1a",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🖨 Imprimir nota de crédito
        </button>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "1px solid #ccc",
            background: "transparent",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ← Volver
        </button>
      </div>

      {/* Documento imprimible */}
      <div
        id="nota-credito"
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          maxWidth: 680,
          margin: "0 auto",
          padding: "40px 48px",
          color: "#111",
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 4,
        }}
      >
        {/* Encabezado */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: 1 }}>TENDANCE</h1>
            <p style={{ fontSize: 11, color: "#555", margin: "4px 0 0" }}>Tienda de ropa · Cochabamba, Bolivia</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              display: "inline-block",
              border: "2px solid #111",
              borderRadius: 4,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
            }}>
              NOTA DE CRÉDITO
            </div>
            <p style={{ fontSize: 11, color: "#555", margin: "8px 0 0" }}>
              N° {credito.id.slice(-8).toUpperCase()}
            </p>
            <p style={{ fontSize: 11, color: "#555", margin: 2 }}>Emisión: {fechaEmision}</p>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "2px solid #111", marginBottom: 24 }} />

        {/* Datos del cliente */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#555", margin: "0 0 10px", textTransform: "uppercase" }}>
            Datos del cliente
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ width: "30%", fontSize: 12, color: "#555", paddingBottom: 4 }}>Nombre:</td>
                <td style={{ fontSize: 13, fontWeight: 600, paddingBottom: 4 }}>{credito.cliente.nombre}</td>
              </tr>
              {credito.cliente.telefono && (
                <tr>
                  <td style={{ fontSize: 12, color: "#555", paddingBottom: 4 }}>Teléfono:</td>
                  <td style={{ fontSize: 13, paddingBottom: 4 }}>{credito.cliente.telefono}</td>
                </tr>
              )}
              {credito.cliente.email && (
                <tr>
                  <td style={{ fontSize: 12, color: "#555", paddingBottom: 4 }}>Email:</td>
                  <td style={{ fontSize: 13, paddingBottom: 4 }}>{credito.cliente.email}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detalle de artículos */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#555", margin: "0 0 10px", textTransform: "uppercase" }}>
            Artículos
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #333" }}>
                <th style={{ textAlign: "left", paddingBottom: 6, fontWeight: 600 }}>Descripción</th>
                <th style={{ textAlign: "center", paddingBottom: 6, fontWeight: 600 }}>Talla</th>
                <th style={{ textAlign: "center", paddingBottom: 6, fontWeight: 600 }}>Color</th>
                <th style={{ textAlign: "center", paddingBottom: 6, fontWeight: 600 }}>Cant.</th>
                <th style={{ textAlign: "right", paddingBottom: 6, fontWeight: 600 }}>P. Unit.</th>
                <th style={{ textAlign: "right", paddingBottom: 6, fontWeight: 600 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {credito.venta.detalles.map((d, i) => (
                <tr key={d.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "7px 0" }}>{d.variante.producto.nombre}</td>
                  <td style={{ textAlign: "center", padding: "7px 0" }}>{d.variante.talla}</td>
                  <td style={{ textAlign: "center", padding: "7px 0" }}>{d.variante.color}</td>
                  <td style={{ textAlign: "center", padding: "7px 0" }}>{d.cantidad}</td>
                  <td style={{ textAlign: "right", padding: "7px 0" }}>Bs. {d.precioUnitario.toFixed(2)}</td>
                  <td style={{ textAlign: "right", padding: "7px 0", fontWeight: 500 }}>
                    Bs. {(d.cantidad * d.precioUnitario).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumen financiero */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
          <table style={{ width: 280, borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <tr>
                <td style={{ paddingBottom: 6, color: "#555" }}>Total de la venta:</td>
                <td style={{ paddingBottom: 6, textAlign: "right" }}>Bs. {credito.montoTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style={{ paddingBottom: 6, color: "#555" }}>Pago inicial:</td>
                <td style={{ paddingBottom: 6, textAlign: "right", color: "#16a34a" }}>
                  Bs. {credito.pagos.length > 0 ? credito.pagos[0].monto.toFixed(2) : "0.00"}
                </td>
              </tr>
              {credito.pagos.slice(1).map((p) => (
                <tr key={p.id}>
                  <td style={{ paddingBottom: 6, color: "#555", fontSize: 11 }}>
                    Abono {new Date(p.createdAt).toLocaleDateString("es-BO")}:
                  </td>
                  <td style={{ paddingBottom: 6, textAlign: "right", color: "#16a34a", fontSize: 11 }}>
                    Bs. {p.monto.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid #111" }}>
                <td style={{ paddingTop: 8, fontWeight: 700, fontSize: 14 }}>SALDO PENDIENTE:</td>
                <td style={{ paddingTop: 8, textAlign: "right", fontWeight: 700, fontSize: 14, color: saldo > 0 ? "#b91c1c" : "#16a34a" }}>
                  Bs. {saldo.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Fecha de vencimiento */}
        <div
          style={{
            border: "1px dashed #aaa",
            borderRadius: 4,
            padding: "12px 16px",
            marginBottom: 28,
            background: "#fafafa",
            fontSize: 12,
          }}
        >
          <strong>Fecha límite de pago:</strong> {fechaVence}
          {credito.notas && (
            <div style={{ marginTop: 6, color: "#555" }}>
              <strong>Notas:</strong> {credito.notas}
            </div>
          )}
        </div>

        {/* Firma */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 60 }}>
          <div style={{ textAlign: "center", width: "42%" }}>
            <div style={{ borderTop: "1px solid #333", paddingTop: 8, fontSize: 11, color: "#555" }}>
              Firma del cliente
            </div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 500 }}>{credito.cliente.nombre}</div>
          </div>
          <div style={{ textAlign: "center", width: "42%" }}>
            <div style={{ borderTop: "1px solid #333", paddingTop: 8, fontSize: 11, color: "#555" }}>
              Firma del vendedor
            </div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 500 }}>Tendance</div>
          </div>
        </div>

        {/* Pie */}
        <div style={{ marginTop: 40, paddingTop: 12, borderTop: "1px solid #ddd", fontSize: 10, color: "#999", textAlign: "center" }}>
          Este documento es válido como comprobante de crédito. Conserve este comprobante hasta la cancelación total del saldo.
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          #nota-credito {
            border: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px 30px !important;
          }
        }
      `}</style>
    </>
  )
}
