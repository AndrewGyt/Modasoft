import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function GET() {
  try {
    const hoy = new Date()
    const inicio90Dias = new Date(hoy.getTime() - 90 * 24 * 60 * 60 * 1000)

    const [detallesVentas, variantes] = await Promise.all([
      db.detalleVenta.findMany({
        where: { venta: { tenantId: TENANT_ID, createdAt: { gte: inicio90Dias } } },
        include: {
          venta: { select: { createdAt: true } },
          variante: {
            include: { producto: { include: { categoria: true } } },
          },
        },
      }),
      db.variante.findMany({
        where: { producto: { tenantId: TENANT_ID } },
        include: { producto: { include: { categoria: true, proveedor: true } } },
      }),
    ])

    const ventasPorCategoria: Record<string, { cantidad: number; total: number }> = {}
    detallesVentas.forEach((d) => {
      const cat = d.variante.producto.categoria.nombre
      if (!ventasPorCategoria[cat]) ventasPorCategoria[cat] = { cantidad: 0, total: 0 }
      ventasPorCategoria[cat].cantidad += d.cantidad
      ventasPorCategoria[cat].total += d.cantidad * d.precioUnitario
    })

    const stockBajo = variantes.filter((v) => v.stockActual <= v.stockMinimo)
    const topCat = Object.entries(ventasPorCategoria).sort((a, b) => b[1].total - a[1].total)

    const usandoApiReal = !!process.env.ANTHROPIC_API_KEY

    if (usandoApiReal) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [{ role: "user", content: `Analiza estos datos de tienda de ropa boliviana y responde SOLO JSON: ${JSON.stringify({ ventasPorCategoria, stockBajo: stockBajo.length })}` }],
        }),
      })
      const data = await response.json()
      const texto = data.content?.[0]?.text || "{}"
      try {
        return NextResponse.json({ analisis: JSON.parse(texto), modo: "ia-real" })
      } catch {
        // si falla el parse, cae al mock
      }
    }

    // MODO DEMO — análisis generado con los datos reales de la tienda
    const analisis = {
      resumen: `Análisis de Tendance basado en ${detallesVentas.length} transacciones de los últimos 90 días. ${topCat.length > 0 ? `La categoría más vendida es ${topCat[0][0]} con Bs. ${topCat[0][1].total.toFixed(2)} en ventas.` : "Aún no hay suficientes datos de ventas para un análisis completo."} ${stockBajo.length > 0 ? `Se detectaron ${stockBajo.length} productos con stock bajo que requieren atención inmediata.` : "El stock general está en niveles saludables."}`,
      prediccionDemanda: topCat.slice(0, 4).map(([cat, datos], i) => ({
        categoria: cat,
        tendencia: i === 0 ? "CRECIENTE" : i === topCat.length - 1 ? "DECRECIENTE" : "ESTABLE",
        confianza: datos.cantidad > 10 ? "ALTA" : datos.cantidad > 5 ? "MEDIA" : "BAJA",
        recomendacion: i === 0
          ? `Aumentar stock de ${cat} — es tu categoría estrella`
          : `Mantener stock actual de ${cat} y monitorear`,
        cantidadSugerida: Math.max(5, Math.round(datos.cantidad * 1.2)),
      })),
      alertas: [
        ...stockBajo.slice(0, 3).map((v) => ({
          tipo: v.stockActual === 0 ? "CRITICO" : "ADVERTENCIA" as "CRITICO" | "ADVERTENCIA",
          titulo: `Stock ${v.stockActual === 0 ? "agotado" : "bajo"}: ${v.producto.nombre}`,
          descripcion: `${v.talla} ${v.color} tiene ${v.stockActual} unidades (mínimo: ${v.stockMinimo}). Lead time del proveedor: ${v.producto.proveedor.leadTimeDias} días.`,
          accion: `Realizar orden de compra inmediata para reponer al menos ${v.stockMinimo * 2} unidades`,
        })),
        ...(topCat.length > 0 ? [{
          tipo: "OPORTUNIDAD" as "OPORTUNIDAD",
          titulo: `Alta demanda en ${topCat[0][0]}`,
          descripcion: `${topCat[0][0]} representa tu categoría más vendida. Considera ampliar el catálogo.`,
          accion: "Contactar proveedores para nuevos modelos en esta categoría",
        }] : []),
      ],
      recomendacionesStock: [
        ...stockBajo.slice(0, 5).map((v) => ({
          producto: `${v.producto.nombre} (${v.talla} ${v.color})`,
          accion: "REPONER" as "REPONER",
          cantidad: v.stockMinimo * 3,
          razon: `Stock actual (${v.stockActual}) por debajo del mínimo (${v.stockMinimo})`,
        })),
        ...variantes
          .filter((v) => v.stockActual > v.stockMinimo * 5)
          .slice(0, 2)
          .map((v) => ({
            producto: `${v.producto.nombre} (${v.talla} ${v.color})`,
            accion: "LIQUIDAR" as "LIQUIDAR",
            cantidad: Math.floor(v.stockActual * 0.3),
            razon: "Stock excesivo — aplicar descuento para rotar inventario",
          })),
      ],
      insightsMercado: [
        {
          titulo: "Segmento clase media-alta",
          descripcion: "Tendance opera en un segmento premium en Bolivia. Los precios deben reflejar calidad y exclusividad para mantener el posicionamiento.",
          impacto: "ALTO" as "ALTO",
        },
        {
          titulo: "Temporadas en Bolivia",
          descripcion: "El mercado boliviano tiene patrones estacionales marcados. Verano (oct-mar) y temporada de fiestas (mayo-jun) son picos de ventas en ropa femenina.",
          impacto: "ALTO" as "ALTO",
        },
        {
          titulo: "Método de pago preferido",
          descripcion: "Analizar qué métodos de pago prefieren tus clientes para optimizar la experiencia de compra.",
          impacto: "MEDIO" as "MEDIO",
        },
        {
          titulo: "Rotación de inventario",
          descripcion: "En moda femenina, las prendas con más de 60 días sin venderse deben liquidarse para dar paso a nueva colección.",
          impacto: "MEDIO" as "MEDIO",
        },
      ],
      prediccionProximoMes: {
        ventasEstimadas: Math.round(
          detallesVentas.reduce((acc, d) => acc + d.cantidad * d.precioUnitario, 0) / 3 * 1.1
        ),
        categoriaEstrella: topCat[0]?.[0] || "Sin datos suficientes",
        riesgoStockout: stockBajo.length > 0
          ? `${stockBajo.length} productos en riesgo de agotarse en los próximos días`
          : "Riesgo bajo — stock en niveles saludables",
      },
    }

    return NextResponse.json({ analisis, modo: "demo" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error en análisis" }, { status: 500 })
  }
}