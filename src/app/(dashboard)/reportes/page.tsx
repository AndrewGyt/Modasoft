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
  margenMes: number
  margenPorcentajeMes: string
  ingresosMes: number
  costoVendidoMes: number
  ventasMesCount: number
  ventasMesAnteriorCount: number
  ventasPorMetodo: { metodo: string; count: number; total: number }[]
  totalCreditoMes: number
  totalCobradoMes: number
  totalPendienteMes: number
  creditosMesCount: number
}

interface ReporteGlobal {
  totalGeneral: number
  ventasPorMes: { mes: string; total: number }[]
  mejorMes: { mes: string; total: number }
  valorInventario: number
  costoInventario: number
  totalVentas: number
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

function nombreMes(key: string) {
  // key = "2026-09"
  return new Date(key + "-02T00:00:00Z").toLocaleDateString("es-BO", { month: "long", year: "numeric" })
}

export default function ReportesPage() {
  const hoy = new Date()
  const [vista, setVista] = useState<"global" | "mes">("mes")
  // Mes más reciente con datos: noviembre 2026
  const [mes, setMes] = useState(10) // noviembre = índice 10
  const [anio, setAnio] = useState(2026)
  const [data, setData] = useState<ReporteData | null>(null)
  const [global, setGlobal] = useState<ReporteGlobal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (vista === "global") {
      fetch("/api/reportes?modo=global")
        .then((r) => r.json())
        .then((d) => { setGlobal(d); setLoading(false) })
    } else {
      fetch(`/api/reportes?mes=${mes}&anio=${anio}`)
        .then((r) => r.json())
        .then((d) => { setData(d); setLoading(false) })
    }
  }, [vista, mes, anio])

  const anios = [2025, 2026, 2027]

  const inputStyle = {
    background: "var(--input)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--foreground)",
    padding: "8px 12px",
    fontSize: "14px",
  }

  const tabStyle = (active: boolean) => ({
    padding: "8px 20px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
    background: active ? "var(--primary)" : "transparent",
    color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
    fontSize: "14px",
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Reportes
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {vista === "global" ? "Todos los meses" : `${MESES[mes]} ${anio}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button style={tabStyle(vista === "global")} onClick={() => setVista("global")}>
            Todos los meses
          </button>
          <button style={tabStyle(vista === "mes")} onClick={() => setVista("mes")}>
            Por mes
          </button>
          {vista === "mes" && (
            <>
              <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))} style={inputStyle}>
                {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={anio} onChange={(e) => setAnio(parseInt(e.target.value))} style={inputStyle}>
                {anios.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted-foreground)" }}>Cargando...</p>
      ) : vista === "global" && global ? (
        <>
          {/* Tarjetas globales */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "Ventas totales",
                value: `Bs. ${global.totalGeneral.toFixed(2)}`,
                sub: `${global.totalVentas} transacciones`,
                positivo: null,
              },
              {
                label: "Mejor mes",
                value: global.mejorMes.mes ? nombreMes(global.mejorMes.mes) : "—",
                sub: global.mejorMes.total > 0 ? `Bs. ${global.mejorMes.total.toFixed(2)}` : "",
                positivo: true,
              },
              {
                label: "Valor inventario",
                value: `Bs. ${global.valorInventario.toFixed(2)}`,
                sub: "a precio de venta",
                positivo: null,
              },
              {
                label: "Margen potencial",
                value: `Bs. ${(global.valorInventario - global.costoInventario).toFixed(2)}`,
                sub: global.costoInventario > 0
                  ? `${(((global.valorInventario - global.costoInventario) / global.costoInventario) * 100).toFixed(1)}% sobre costo`
                  : "",
                positivo: true,
              },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border p-5 space-y-2"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{card.value}</p>
                <p className="text-xs" style={{
                  color: card.positivo === true ? "#10B981" : "var(--muted-foreground)",
                }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Gráfico ventas por mes */}
          <div className="rounded-xl border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
              Ventas por mes
            </h2>
            {global.ventasPorMes.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin datos</p>
            ) : (
              <GraficoVentas datos={global.ventasPorMes.map((v) => ({
                dia: nombreMes(v.mes),
                total: v.total,
              }))} />
            )}
          </div>
        </>
      ) : vista === "mes" && data ? (
        <>
          {/* Tarjetas por mes */}
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
                label: "Margen del mes",
                value: `Bs. ${data.margenMes.toFixed(2)}`,
                sub: `${data.margenPorcentajeMes}% sobre ventas`,
                positivo: data.margenMes >= 0,
              },
              {
                label: "Valor inventario actual",
                value: `Bs. ${data.valorInventario.toFixed(2)}`,
                sub: `Costo: Bs. ${data.costoInventario.toFixed(2)}`,
                positivo: null,
              },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border p-5 space-y-2"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{card.label}</p>
                <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{card.value}</p>
                <p className="text-xs" style={{
                  color: card.positivo === true ? "#10B981" : card.positivo === false ? "var(--destructive)" : "var(--muted-foreground)",
                }}>{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
              Ventas por día — {MESES[mes]} {anio}
            </h2>
            <GraficoVentas datos={data.ventasPorDia} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Ventas por categoría</h2>
              {data.datosCategoria.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin datos</p>
              ) : (
                <GraficoCategorias datos={data.datosCategoria} />
              )}
            </div>
            <div className="rounded-xl border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Top 10 productos más vendidos</h2>
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
                        <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>{p.nombre}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Bs. {p.total.toFixed(2)}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{p.cantidad} uds</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Métodos de pago + Créditos del mes */}
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Métodos de pago</h2>
              {data.ventasPorMetodo.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin datos</p>
              ) : (
                <div className="space-y-3">
                  {data.ventasPorMetodo.map((m) => {
                    const colores: Record<string, { bg: string; text: string }> = {
                      QR:          { bg: "#dbeafe", text: "#1e40af" },
                      CREDITO:     { bg: "#fef3c7", text: "#92400e" },
                      EFECTIVO:    { bg: "#dcfce7", text: "#166534" },
                      TRANSFERENCIA:{ bg: "#f3e8ff", text: "#6b21a8" },
                    }
                    const c = colores[m.metodo] ?? { bg: "var(--muted)", text: "var(--muted-foreground)" }
                    return (
                      <div key={m.metodo} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: c.bg, color: c.text }}>
                            {m.metodo}
                          </span>
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {m.count} venta{m.count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                          Bs. {m.total.toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
                Créditos del mes
              </h2>
              {data.creditosMesCount === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin créditos este mes</p>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Total en créditos", value: data.totalCreditoMes, color: "var(--foreground)" },
                    { label: "Ya cobrado", value: data.totalCobradoMes, color: "#10B981" },
                    { label: "Por cobrar", value: data.totalPendienteMes, color: "#EF4444" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{row.label}</span>
                      <span className="font-semibold text-sm" style={{ color: row.color }}>
                        Bs. {row.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="w-full rounded-full h-2 mt-1" style={{ background: "var(--muted)" }}>
                    <div className="h-2 rounded-full" style={{
                      width: `${data.totalCreditoMes > 0 ? (data.totalCobradoMes / data.totalCreditoMes) * 100 : 0}%`,
                      background: "#10B981"
                    }} />
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {data.creditosMesCount} crédito{data.creditosMesCount !== 1 ? "s" : ""} · {data.totalCreditoMes > 0 ? ((data.totalCobradoMes / data.totalCreditoMes) * 100).toFixed(0) : 0}% cobrado
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}