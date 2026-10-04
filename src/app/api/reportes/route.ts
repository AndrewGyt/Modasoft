import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mes = parseInt(searchParams.get("mes") || "0")
  const anio = parseInt(searchParams.get("anio") || "2026")

  const inicioMes = new Date(anio, mes, 1)
  const finMes = new Date(anio, mes + 1, 0, 23, 59, 59)
  const inicioMesAnterior = new Date(anio, mes - 1, 1)
  const finMesAnterior = new Date(anio, mes, 0, 23, 59, 59)

  const [ventasMes, ventasMesAnterior, detallesVentas, variantes] = await Promise.all([
    db.venta.findMany({
      where: { tenantId: TENANT_ID, createdAt: { gte: inicioMes, lte: finMes } },
    }),
    db.venta.findMany({
      where: { tenantId: TENANT_ID, createdAt: { gte: inicioMesAnterior, lte: finMesAnterior } },
    }),
    db.detalleVenta.findMany({
      where: { venta: { tenantId: TENANT_ID, createdAt: { gte: inicioMes, lte: finMes } } },
      include: {
        variante: { include: { producto: { include: { categoria: true } } } },
      },
    }),
    db.variante.findMany({
      where: { producto: { tenantId: TENANT_ID } },
      include: { producto: true },
    }),
  ])

  const totalMes = ventasMes.reduce((acc, v) => acc + v.total, 0)
  const totalMesAnterior = ventasMesAnterior.reduce((acc, v) => acc + v.total, 0)
  const crecimiento = totalMesAnterior > 0
    ? (((totalMes - totalMesAnterior) / totalMesAnterior) * 100).toFixed(1)
    : null

  const diasEnMes = finMes.getDate()
  const ventasPorDia = Array.from({ length: diasEnMes }, (_, i) => {
    const fecha = new Date(anio, mes, i + 1)
    const dia = `${i + 1}`
    const total = ventasMes
      .filter((v) => new Date(v.createdAt).getDate() === i + 1)
      .reduce((acc, v) => acc + v.total, 0)
    return { dia, total }
  })

  const ventasPorCategoria: Record<string, number> = {}
  const ventasPorProducto: Record<string, { nombre: string; cantidad: number; total: number }> = {}

  detallesVentas.forEach((d) => {
    const cat = d.variante.producto.categoria.nombre
    const prod = d.variante.producto.nombre
    ventasPorCategoria[cat] = (ventasPorCategoria[cat] || 0) + d.cantidad * d.precioUnitario
    if (!ventasPorProducto[prod]) ventasPorProducto[prod] = { nombre: prod, cantidad: 0, total: 0 }
    ventasPorProducto[prod].cantidad += d.cantidad
    ventasPorProducto[prod].total += d.cantidad * d.precioUnitario
  })

  const datosCategoria = Object.entries(ventasPorCategoria)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total)

  const topProductos = Object.values(ventasPorProducto)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const valorInventario = variantes.reduce((acc, v) => acc + v.stockActual * v.producto.precioVenta, 0)
  const costoInventario = variantes.reduce((acc, v) => acc + v.stockActual * v.producto.precioCompra, 0)

  return NextResponse.json({
    totalMes,
    totalMesAnterior,
    crecimiento,
    ventasPorDia,
    datosCategoria,
    topProductos,
    valorInventario,
    costoInventario,
    ventasMesCount: ventasMes.length,
    ventasMesAnteriorCount: ventasMesAnterior.length,
  })
}