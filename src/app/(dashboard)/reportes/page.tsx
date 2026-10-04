"use client"

import { useState, useEffect } from "react"
import GraficoVentas from "@/components/modules/GraficoVentas"
import GraficoCategorias from "@/components/modules/GraficoCategorias"

interface ReporteData {
  totalMes: number
  totalMesAnterior: number
  crecimiento: string | null
  ventasPorDia: { dia: string; total: number }[]
  datosCategoria: { nombre: string; total: number }[]
  topProductos: { nombre: string; cantidad: number; total: number }[]
  valorInventario: number
  costoInventario: number
  ventasMesCount: number
  ventasMesAnteriorCount: number
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export default function ReportesPage() {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/reportes?mes=${mes}&anio=${anio}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [mes, anio])

  const anios = [2025, 2026, 2027]

  const inputStyle = {
    background: "var(--input)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--foreground)",
    padding: "8px 12px",
    fontSize: "14px",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Reportes
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {MESES[mes]} {anio}
          </p>
        </div>
        <div className="flex gap-2">
          <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))} style={inputStyle}>
            {MESES.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select value={anio} onChange={(e) => setAnio(parseInt(e.target.value))} style={inputStyle}>
            {anios.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted-foreground)" }}>Cargando...</p>
      ) : data && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: `Ventas ${MESES[mes]}`,
                value: `Bs. ${data.totalMes.toFixed(2)}`,
                sub: data.crecimiento
                  ? `${Number(data.crecimiento) >= 0 ? "+" : ""}${data.crecimiento}% vs mes anterior`
                  : "Sin datos anteriores",
                positivo: data.crecimiento ? Number(data.crecimiento) >= 0 : null,
              },
              {
                label: "Mes anterior",
                value: `Bs. ${data.totalMesAnterior.toFixed(2)}`,
                sub: `${data.ventasMesAnteriorCount} transacciones`,
                positivo: null,
              },
              {
                label: "Valor inventario",
                value: `Bs. ${data.valorInventario.toFixed(2)}`,
                sub: "a precio de venta",
                positivo: null,
              },
              {
                label: "Margen potencial",
                value: `Bs. ${(data.valorInventario - data.costoInventario).toFixed(2)}`,
                sub: data.costoInventario > 0
                  ? `${(((data.valorInventario - data.costoInventario) / data.costoInventario) * 100).toFixed(1)}% sobre costo`
                  : "",
                positivo: true,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl border p-5 space-y-2"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{card.value}</p>
                <p className="text-xs" style={{
                  color: card.positivo === true ? "#10B981" : card.positivo === false ? "var(--destructive)" : "var(--muted-foreground)",
                }}>
                  {card.sub}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl border p-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
              Ventas por día — {MESES[mes]} {anio}
            </h2>
            <GraficoVentas datos={data.ventasPorDia} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div
              className="rounded-xl border p-6"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
                Ventas por categoría
              </h2>
              {data.datosCategoria.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin datos</p>
              ) : (
                <GraficoCategorias datos={data.datosCategoria} />
              )}
            </div>

            <div
              className="rounded-xl border p-6"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
                Top 10 productos más vendidos
              </h2>
              {data.topProductos.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin datos</p>
              ) : (
                <div className="space-y-2">
                  {data.topProductos.map((p, i) => (
                    <div key={p.nombre} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs font-bold w-5 text-center" style={{ color: "var(--muted-foreground)" }}>
                          {i + 1}
                        </span>
                        <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>
                          {p.nombre}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                          Bs. {p.total.toFixed(2)}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {p.cantidad} uds
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}