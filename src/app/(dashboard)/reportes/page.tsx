import { db } from "@/lib/db"
import GraficoVentas from "@/components/modules/GraficoVentas"
import GraficoCategorias from "@/components/modules/GraficoCategorias"

const TENANT_ID = "tendance-001"

export default async function ReportesPage() {
  const hoy = new Date()
  const inicio30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
  const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0)

  const [ventas30Dias, ventasMes, ventasMesAnterior, detallesVentas, variantes] = await Promise.all([
    db.venta.findMany({
      where: { tenantId: TENANT_ID, createdAt: { gte: inicio30Dias } },
      orderBy: { createdAt: "asc" },
    }),
    db.venta.findMany({
      where: { tenantId: TENANT_ID, createdAt: { gte: inicioMes } },
    }),
    db.venta.findMany({
      where: { tenantId: TENANT_ID, createdAt: { gte: inicioMesAnterior, lte: finMesAnterior } },
    }),
    db.detalleVenta.findMany({
      where: { venta: { tenantId: TENANT_ID, createdAt: { gte: inicio30Dias } } },
      include: {
        variante: {
          include: { producto: { include: { categoria: true } } },
        },
      },
    }),
    db.variante.findMany({
      where: { producto: { tenantId: TENANT_ID } },
      include: { producto: { include: { categoria: true } } },
    }),
  ])

  const totalMes = ventasMes.reduce((acc, v) => acc + v.total, 0)
  const totalMesAnterior = ventasMesAnterior.reduce((acc, v) => acc + v.total, 0)
  const crecimiento = totalMesAnterior > 0
    ? (((totalMes - totalMesAnterior) / totalMesAnterior) * 100).toFixed(1)
    : null

  const ventasPorDia = Array.from({ length: 30 }, (_, i) => {
    const fecha = new Date(hoy.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
    const dia = fecha.toLocaleDateString("es-BO", { day: "numeric", month: "short" })
    const total = ventas30Dias
      .filter((v) => new Date(v.createdAt).toDateString() === fecha.toDateString())
      .reduce((acc, v) => acc + v.total, 0)
    return { dia, total }
  })

  const ventasPorCategoria: Record<string, number> = {}
  detallesVentas.forEach((d) => {
    const cat = d.variante.producto.categoria.nombre
    ventasPorCategoria[cat] = (ventasPorCategoria[cat] || 0) + d.cantidad * d.precioUnitario
  })
  const datosCategoria = Object.entries(ventasPorCategoria)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total)

  const productosMasVendidos: Record<string, { nombre: string; cantidad: number; total: number }> = {}
  detallesVentas.forEach((d) => {
    const nombre = d.variante.producto.nombre
    if (!productosMasVendidos[nombre]) {
      productosMasVendidos[nombre] = { nombre, cantidad: 0, total: 0 }
    }
    productosMasVendidos[nombre].cantidad += d.cantidad
    productosMasVendidos[nombre].total += d.cantidad * d.precioUnitario
  })
  const topProductos = Object.values(productosMasVendidos)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const valorInventario = variantes.reduce(
    (acc, v) => acc + v.stockActual * v.producto.precioVenta, 0
  )
  const costoInventario = variantes.reduce(
    (acc, v) => acc + v.stockActual * v.producto.precioCompra, 0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Reportes
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Análisis de los últimos 30 días
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Ventas este mes",
            value: `Bs. ${totalMes.toFixed(2)}`,
            sub: crecimiento ? `${Number(crecimiento) >= 0 ? "+" : ""}${crecimiento}% vs mes anterior` : "Sin datos anteriores",
            positivo: crecimiento ? Number(crecimiento) >= 0 : null,
          },
          {
            label: "Mes anterior",
            value: `Bs. ${totalMesAnterior.toFixed(2)}`,
            sub: `${ventasMesAnterior.length} transacciones`,
            positivo: null,
          },
          {
            label: "Valor inventario",
            value: `Bs. ${valorInventario.toFixed(2)}`,
            sub: "a precio de venta",
            positivo: null,
          },
          {
            label: "Margen potencial",
            value: `Bs. ${(valorInventario - costoInventario).toFixed(2)}`,
            sub: costoInventario > 0 ? `${(((valorInventario - costoInventario) / costoInventario) * 100).toFixed(1)}% sobre costo` : "",
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
            <p
              className="text-xs"
              style={{
                color: card.positivo === true ? "#10B981" : card.positivo === false ? "var(--destructive)" : "var(--muted-foreground)",
              }}
            >
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
          Ventas últimos 30 días
        </h2>
        <GraficoVentas datos={ventasPorDia} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div
          className="rounded-xl border p-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Ventas por categoría
          </h2>
          {datosCategoria.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin datos</p>
          ) : (
            <GraficoCategorias datos={datosCategoria} />
          )}
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Top 10 productos más vendidos
          </h2>
          {topProductos.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin datos</p>
          ) : (
            <div className="space-y-2">
              {topProductos.map((p, i) => (
                <div key={p.nombre} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="text-xs font-bold w-5 text-center"
                      style={{ color: "var(--muted-foreground)" }}
                    >
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
    </div>
  )
}