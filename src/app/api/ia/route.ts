import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function GET() {
  try {
    const hoy = new Date()
    const inicio90Dias = new Date(hoy.getTime() - 90 * 24 * 60 * 60 * 1000)

    const [detallesVentas, variantes, ordenes] = await Promise.all([
      db.detalleVenta.findMany({
        where: { venta: { tenantId: TENANT_ID, createdAt: { gte: inicio90Dias } } },
        include: {
          venta: { select: { createdAt: true, metodoPago: true, total: true } },
          variante: {
            include: { producto: { include: { categoria: true, proveedor: true } } },
          },
        },
        orderBy: { venta: { createdAt: "asc" } },
      }),
      db.variante.findMany({
        where: { producto: { tenantId: TENANT_ID } },
        include: { producto: { include: { categoria: true, proveedor: true } } },
      }),
      db.ordenCompra.findMany({
        where: { tenantId: TENANT_ID },
        include: { proveedor: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ])

    const ventasPorCategoria: Record<string, { cantidad: number; total: number }> = {}
    const ventasPorProducto: Record<string, { nombre: string; cantidad: number; total: number; categoria: string }> = {}
    const ventasPorMes: Record<string, number> = {}
    const ventasPorMetodoPago: Record<string, number> = {}

    detallesVentas.forEach((d) => {
      const cat = d.variante.producto.categoria.nombre
      const prod = d.variante.producto.nombre
      const mes = new Date(d.venta.createdAt).toLocaleDateString("es-BO", { month: "long", year: "numeric" })
      const metodo = d.venta.metodoPago

      if (!ventasPorCategoria[cat]) ventasPorCategoria[cat] = { cantidad: 0, total: 0 }
      ventasPorCategoria[cat].cantidad += d.cantidad
      ventasPorCategoria[cat].total += d.cantidad * d.precioUnitario

      if (!ventasPorProducto[prod]) ventasPorProducto[prod] = { nombre: prod, cantidad: 0, total: 0, categoria: cat }
      ventasPorProducto[prod].cantidad += d.cantidad
      ventasPorProducto[prod].total += d.cantidad * d.precioUnitario

      ventasPorMes[mes] = (ventasPorMes[mes] || 0) + d.cantidad * d.precioUnitario
      ventasPorMetodoPago[metodo] = (ventasPorMetodoPago[metodo] || 0) + 1
    })

    const stockBajo = variantes.filter((v) => v.stockActual <= v.stockMinimo)
    const stockCritico = variantes.filter((v) => v.stockActual === 0)
    const totalVentas = detallesVentas.reduce((acc, d) => acc + d.cantidad * d.precioUnitario, 0)
    const valorInventario = variantes.reduce((acc, v) => acc + v.stockActual * v.producto.precioVenta, 0)
    const costoInventario = variantes.reduce((acc, v) => acc + v.stockActual * v.producto.precioCompra, 0)

    const contexto = {
      tienda: "Tendance - ropa femenina clase media-alta, Cochabamba Bolivia",
      periodo: "últimos 90 días",
      totalVentasBs: totalVentas.toFixed(2),
      ventasPorCategoria,
      topProductos: Object.values(ventasPorProducto).sort((a, b) => b.total - a.total).slice(0, 10),
      ventasPorMes,
      ventasPorMetodoPago,
      stockBajo: stockBajo.map((v) => ({
        producto: v.producto.nombre,
        categoria: v.producto.categoria.nombre,
        talla: v.talla,
        stockActual: v.stockActual,
        stockMinimo: v.stockMinimo,
        leadTimeDias: v.producto.proveedor.leadTimeDias,
        precioVenta: v.producto.precioVenta,
      })),
      stockCritico: stockCritico.map((v) => ({
        producto: v.producto.nombre,
        talla: v.talla,
      })),
      valorInventarioBs: valorInventario.toFixed(2),
      costoInventarioBs: costoInventario.toFixed(2),
      margenPotencialBs: (valorInventario - costoInventario).toFixed(2),
      totalProductos: variantes.length,
    }

    const prompt = `Eres un analista experto en retail de moda femenina en Bolivia. Analiza estos datos reales de "Tendance" y genera un análisis profundo y específico. NO uses datos genéricos, usa los números exactos que te proporciono.

DATOS REALES DE TENDANCE:
${JSON.stringify(contexto, null, 2)}

Responde ÚNICAMENTE con un objeto JSON válido sin texto adicional ni backticks markdown. IMPORTANTE: usa punto como separador decimal y NO uses separadores de miles en los números (ejemplo: 25280.50 no 25.280,50). Los textos descriptivos pueden estar en español normal. IMPORTANTE: Sé conciso. Máximo 4 items en prediccionDemanda, 4 en alertas, 5 en recomendacionesStock, 3 en insightsMercado. Textos cortos de máximo 100 caracteres por campo:
{
  "resumen": "párrafo específico con los hallazgos más importantes usando los números reales",
  "prediccionDemanda": [
    {
      "categoria": "nombre exacto de la categoría",
      "tendencia": "CRECIENTE|ESTABLE|DECRECIENTE",
      "confianza": "ALTA|MEDIA|BAJA",
      "recomendacion": "acción específica con números concretos",
      "cantidadSugerida": numero
    }
  ],
  "alertas": [
    {
      "tipo": "CRITICO|ADVERTENCIA|OPORTUNIDAD",
      "titulo": "título corto y específico",
      "descripcion": "descripción detallada con números reales",
      "accion": "acción inmediata y concreta"
    }
  ],
  "recomendacionesStock": [
    {
      "producto": "nombre exacto del producto",
      "accion": "REPONER|LIQUIDAR|MANTENER",
      "cantidad": numero,
      "razon": "razón específica basada en los datos"
    }
  ],
  "insightsMercado": [
    {
      "titulo": "título del insight",
      "descripcion": "descripción basada en patrones reales detectados",
      "impacto": "ALTO|MEDIO|BAJO"
    }
  ],
  "prediccionProximoMes": {
    "ventasEstimadas": numero,
    "categoriaEstrella": "categoría con mayor potencial basada en datos",
    "riesgoStockout": "descripción específica del riesgo"
  }
}`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 6000,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Anthropic API error:", data)
      throw new Error(data.error?.message || "Error en API de Anthropic")
    }

    const texto = data.content?.[0]?.text || ""
    console.log("Respuesta Claude (primeros 200 chars):", texto.slice(0, 200))

    let analisis
    try {
      const textoLimpio = texto
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
      analisis = JSON.parse(textoLimpio)
    } catch {
      try {
        const match = texto.match(/\{[\s\S]*\}/)
        if (match) {
          const textoMatch = match[0]
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
            .replace(/,(\s*[}\]])/g, "$1")
          analisis = JSON.parse(textoMatch)
        } else {
          throw new Error("No se pudo parsear respuesta")
        }
      } catch (e2) {
        console.error("Parse error:", e2)
        console.error("Texto recibido:", texto.slice(0, 500))
        throw new Error("No se pudo parsear respuesta de IA")
      }
    }

    return NextResponse.json({ analisis, modo: "ia-real", contexto })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error en análisis IA" }, { status: 500 })
  }
}