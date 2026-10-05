import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { mensaje, historial } = body

    const hoy = new Date()
    const inicio90Dias = new Date(hoy.getTime() - 90 * 24 * 60 * 60 * 1000)

    const [ventas, detallesVentas, variantes, creditos] = await Promise.all([
      db.venta.findMany({
        where: { tenantId: TENANT_ID, createdAt: { gte: inicio90Dias } },
        orderBy: { createdAt: "desc" },
      }),
      db.detalleVenta.findMany({
          where: { venta: { tenantId: TENANT_ID, createdAt: { gte: inicio90Dias } } },
          include: {
            venta: true,
            variante: { include: { producto: { include: { categoria: true } } } },
          },
        }),
      db.variante.findMany({
        where: { producto: { tenantId: TENANT_ID } },
        include: { producto: { include: { categoria: true, proveedor: true } } },
      }),
      db.credito.findMany({
        where: { tenantId: TENANT_ID },
        include: { cliente: true },
      }),
    ])

    const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0)
    const ventasPorCategoria: Record<string, { cantidad: number; total: number }> = {}
    const ventasPorProducto: Record<string, { nombre: string; cantidad: number; total: number }> = {}
    const ventasPorMes: Record<string, number> = {}

    detallesVentas.forEach((d) => {
      const cat = d.variante.producto.categoria.nombre
      const prod = d.variante.producto.nombre
      const mes = new Date(d.venta.createdAt).toLocaleDateString("es-BO", { month: "long", year: "numeric" })

      if (!ventasPorCategoria[cat]) ventasPorCategoria[cat] = { cantidad: 0, total: 0 }
      ventasPorCategoria[cat].cantidad += d.cantidad
      ventasPorCategoria[cat].total += d.cantidad * d.precioUnitario

      if (!ventasPorProducto[prod]) ventasPorProducto[prod] = { nombre: prod, cantidad: 0, total: 0 }
      ventasPorProducto[prod].cantidad += d.cantidad
      ventasPorProducto[prod].total += d.cantidad * d.precioUnitario

      ventasPorMes[mes] = (ventasPorMes[mes] || 0) + d.cantidad * d.precioUnitario
    })

    const stockBajo = variantes.filter((v) => v.stockActual <= v.stockMinimo)
    const valorInventario = variantes.reduce((acc, v) => acc + v.stockActual * v.producto.precioVenta, 0)
    const totalCreditoPendiente = creditos
      .filter((c) => c.estado !== "PAGADO")
      .reduce((acc, c) => acc + (c.montoTotal - c.montoPagado), 0)

    const contexto = `
DATOS ACTUALES DE TENDANCE (tienda de ropa femenina, Cochabamba Bolivia, segmento clase media-alta):

VENTAS (últimos 90 días):
- Total vendido: Bs. ${totalVentas.toFixed(2)}
- Número de ventas: ${ventas.length}
- Por mes: ${JSON.stringify(ventasPorMes)}
- Por categoría: ${JSON.stringify(ventasPorCategoria)}
- Top productos: ${JSON.stringify(Object.values(ventasPorProducto).sort((a, b) => b.total - a.total).slice(0, 10))}

INVENTARIO:
- Total variantes: ${variantes.length}
- Valor inventario: Bs. ${valorInventario.toFixed(2)}
- Productos con stock bajo: ${stockBajo.length}
- Detalle stock bajo: ${JSON.stringify(stockBajo.map(v => ({ producto: v.producto.nombre, stock: v.stockActual, minimo: v.stockMinimo })))}

CRÉDITOS:
- Total pendiente por cobrar: Bs. ${totalCreditoPendiente.toFixed(2)}
- Créditos activos: ${creditos.filter(c => c.estado !== "PAGADO").length}
- Clientes con crédito: ${JSON.stringify(creditos.filter(c => c.estado !== "PAGADO").map(c => ({ cliente: c.cliente.nombre, pendiente: (c.montoTotal - c.montoPagado).toFixed(2), vencimiento: c.fechaVencimiento })))}
`

    const messages = [
      ...(historial || []),
      { role: "user", content: mensaje },
    ]

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: `Eres el asistente de IA de ModaSoft para la tienda Tendance. Respondes preguntas sobre ventas, inventario, créditos y el negocio basándote ÚNICAMENTE en los datos reales que te proporciono. Sé conciso, directo y usa números exactos. Si no tienes el dato, dilo claramente. Responde siempre en español.

${contexto}`,
        messages,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || "Error en API")
    }

    const respuesta = data.content?.[0]?.text || ""
    return NextResponse.json({ respuesta })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error en chat" }, { status: 500 })
  }
}