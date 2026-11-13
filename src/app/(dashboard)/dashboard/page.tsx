import { db } from "@/lib/db"
import { ShoppingCart, Package, AlertTriangle, TrendingUp } from "lucide-react"
import GraficoVentas from "@/components/modules/GraficoVentas"
import GraficoMetodoPago from "@/components/modules/GraficoMetodoPago"

const TENANT_ID = "tendance-001"

export default async function DashboardPage() {
  const hoy = new Date()
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const inicio7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [ventasHoy, ventasMes, variantes, ventas7Dias] = await Promise.all([
    db.venta.findMany({
      where: { tenantId: TENANT_ID, createdAt: { gte: inicioHoy } },
    }),
    db.venta.findMany({
      where: { tenantId: TENANT_ID, createdAt: { gte: inicioMes } },
    }),
    db.variante.findMany({
      where: { producto: { tenantId: TENANT_ID } },
      include: { producto: { include: { categoria: true } } },
    }),
    db.venta.findMany({
      where: { tenantId: TENANT_ID, createdAt: { gte: inicio7Dias } },
      orderBy: { createdAt: "asc" },
    }),
  ])

  // Desglose por método de pago (mes actual)
  const metodosPago = ventasMes.reduce<Record<string, { cantidad: number; total: number }>>((acc, v) => {
    const metodo = v.metodoPago || "otro"
    if (!acc[metodo]) acc[metodo] = { cantidad: 0, total: 0 }
    acc[metodo].cantidad += 1
    acc[metodo].total += v.total
    return acc
  }, {})
  const datosMetodoPago = Object.entries(metodosPago).map(([metodo, datos]) => ({
    metodo,
    ...datos,
  }))

  const totalHoy = ventasHoy.reduce((acc, v) => acc + v.total, 0)
  const totalMes = ventasMes.reduce((acc, v) => acc + v.total, 0)
  const variantesActivas = variantes.filter((v) => v.estado !== "BAJA")
  const stockBajo = variantesActivas.filter((v) => v.stockActual <= v.stockMinimo)
  const totalProductos = variantesActivas.length

  // Stock agrupado por categoría
  const stockPorCategoria = variantesActivas.reduce<
    Record<string, { nombre: string; stockTotal: number; variantesTotal: number; stockBajoCount: number }>
  >((acc, v) => {
    const cat = v.producto.categoria.nombre
    if (!acc[cat]) acc[cat] = { nombre: cat, stockTotal: 0, variantesTotal: 0, stockBajoCount: 0 }
    acc[cat].stockTotal += v.stockActual
    acc[cat].variantesTotal += 1
    if (v.stockActual <= v.stockMinimo) acc[cat].stockBajoCount += 1
    return acc
  }, {})
  const categoriasBajoStock = Object.values(stockPorCategoria)
    .filter((c) => c.stockBajoCount > 0)
    .sort((a, b) => b.stockBajoCount - a.stockBajoCount)

  const ventasPorDia = Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(hoy.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
    const dia = fecha.toLocaleDateString("es-BO", { weekday: "short", day: "numeric" })
    const total = ventas7Dias
      .filter((v) => new Date(v.createdAt).toDateString() === fecha.toDateString())
      .reduce((acc, v) => acc + v.total, 0)
    return { dia, total }
  })

  const cards = [
    {
      label: "Ventas hoy",
      value: `Bs. ${totalHoy.toFixed(2)}`,
      icon: ShoppingCart,
      sub: `${ventasHoy.length} transacciones`,
    },
    {
      label: "Ventas del mes",
      value: `Bs. ${totalMes.toFixed(2)}`,
      icon: TrendingUp,
      sub: `${ventasMes.length} transacciones`,
    },
    {
      label: "Productos en stock",
      value: totalProductos.toString(),
      icon: Package,
      sub: "variantes registradas",
    },
    {
      label: "Stock bajo",
      value: stockBajo.length.toString(),
      icon: AlertTriangle,
      sub: "productos por reabastecer",
      alerta: stockBajo.length > 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {hoy.toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-xl border p-5 space-y-3"
              style={{
                background: "var(--card)",
                borderColor: card.alerta ? "var(--destructive)" : "var(--border)",
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                  {card.label}
                </p>
                <Icon
                  size={18}
                  style={{ color: card.alerta ? "var(--destructive)" : "var(--muted-foreground)" }}
                />
              </div>
              <p className="text-2xl font-bold" style={{ color: card.alerta ? "var(--destructive)" : "var(--foreground)" }}>
                {card.value}
              </p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {card.sub}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          className="rounded-xl border p-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Ventas últimos 7 días
          </h2>
          <GraficoVentas datos={ventasPorDia} />
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Ventas por método de pago (este mes)
          </h2>
          <GraficoMetodoPago datos={datosMetodoPago} />
        </div>
      </div>

      {categoriasBajoStock.length > 0 && (
        <div
          className="rounded-xl border p-6"
          style={{ background: "var(--card)", borderColor: "var(--destructive)" }}
        >
          <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            🚨 Categorías con stock bajo
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {categoriasBajoStock.map((cat) => (
              <div
                key={cat.nombre}
                className="rounded-lg p-3 space-y-1"
                style={{ background: "var(--muted)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  {cat.nombre}
                </p>
                <p className="text-xs" style={{ color: "var(--destructive)" }}>
                  {cat.stockBajoCount} variante{cat.stockBajoCount !== 1 ? "s" : ""} bajo mínimo
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Stock total: {cat.stockTotal} uds.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {stockBajo.length > 0 && (
        <div
          className="rounded-xl border p-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <h2 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>
            Productos con stock bajo
          </h2>
          <div className="space-y-2">
            {stockBajo.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "var(--muted)" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {v.producto.nombre}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {v.talla} · {v.color}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: "var(--destructive)" }}>
                    {v.stockActual} unidades
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    mínimo: {v.stockMinimo}
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