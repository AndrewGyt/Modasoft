import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"
const COSTO_OPERATIVO_PCT = 0.15

export async function GET() {
  try {
    const [detallesVentas, variantes] = await Promise.all([
      db.detalleVenta.findMany({
        where: { venta: { tenantId: TENANT_ID } },
        include: {
          venta: { select: { createdAt: true, metodoPago: true } },
          variante: {
            include: {
              producto: {
                include: { categoria: true, proveedor: true },
              },
            },
          },
        },
      }),
      db.variante.findMany({
        where: { producto: { tenantId: TENANT_ID } },
        include: { producto: { include: { categoria: true } } },
      }),
    ])

    const rentabilidadPorProducto: Record<string, {
      nombre: string
      categoria: string
      unidadesVendidas: number
      ingresoTotal: number
      costoTotal: number
      costoOperativo: number
      gananciaReal: number
      margenReal: number
      precioVenta: number
      precioCompra: number
    }> = {}

    detallesVentas.forEach((d) => {
      const prod = d.variante.producto.nombre
      const precioCompra = d.variante.producto.precioCompra
      const costoOperativo = d.precioUnitario * COSTO_OPERATIVO_PCT

      if (!rentabilidadPorProducto[prod]) {
        rentabilidadPorProducto[prod] = {
          nombre: prod,
          categoria: d.variante.producto.categoria.nombre,
          unidadesVendidas: 0,
          ingresoTotal: 0,
          costoTotal: 0,
          costoOperativo: 0,
          gananciaReal: 0,
          margenReal: 0,
          precioVenta: d.precioUnitario,
          precioCompra,
        }
      }

      const r = rentabilidadPorProducto[prod]
      r.unidadesVendidas += d.cantidad
      r.ingresoTotal += d.precioUnitario * d.cantidad
      r.costoTotal += precioCompra * d.cantidad
      r.costoOperativo += costoOperativo * d.cantidad
    })

    Object.values(rentabilidadPorProducto).forEach((r) => {
      r.gananciaReal = r.ingresoTotal - r.costoTotal - r.costoOperativo
      r.margenReal = r.ingresoTotal > 0
        ? parseFloat(((r.gananciaReal / r.ingresoTotal) * 100).toFixed(1))
        : 0
    })

    const rentabilidadPorCategoria: Record<string, {
      nombre: string
      ingresoTotal: number
      gananciaReal: number
      margenReal: number
      unidades: number
    }> = {}

    Object.values(rentabilidadPorProducto).forEach((r) => {
      if (!rentabilidadPorCategoria[r.categoria]) {
        rentabilidadPorCategoria[r.categoria] = {
          nombre: r.categoria,
          ingresoTotal: 0,
          gananciaReal: 0,
          margenReal: 0,
          unidades: 0,
        }
      }
      const cat = rentabilidadPorCategoria[r.categoria]
      cat.ingresoTotal += r.ingresoTotal
      cat.gananciaReal += r.gananciaReal
      cat.unidades += r.unidadesVendidas
    })

    Object.values(rentabilidadPorCategoria).forEach((cat) => {
      cat.margenReal = cat.ingresoTotal > 0
        ? parseFloat(((cat.gananciaReal / cat.ingresoTotal) * 100).toFixed(1))
        : 0
    })

    const topRentables = Object.values(rentabilidadPorProducto)
      .sort((a, b) => b.gananciaReal - a.gananciaReal)
      .slice(0, 10)

    const menosRentables = Object.values(rentabilidadPorProducto)
      .filter((r) => r.unidadesVendidas > 0)
      .sort((a, b) => a.margenReal - b.margenReal)
      .slice(0, 5)

    const totalIngreso = Object.values(rentabilidadPorProducto).reduce((acc, r) => acc + r.ingresoTotal, 0)
    const totalGanancia = Object.values(rentabilidadPorProducto).reduce((acc, r) => acc + r.gananciaReal, 0)
    const margenGeneral = totalIngreso > 0 ? ((totalGanancia / totalIngreso) * 100).toFixed(1) : "0"

    const prompt = `Eres experto en análisis financiero de retail de moda en Bolivia. Analiza la rentabilidad real de Tendance considerando costos operativos del 15%.

RESUMEN FINANCIERO:
- Ingreso total: Bs. ${totalIngreso.toFixed(2)}
- Ganancia real (después de costos): Bs. ${totalGanancia.toFixed(2)}
- Margen general: ${margenGeneral}%

TOP 10 PRODUCTOS MÁS RENTABLES:
${JSON.stringify(topRentables, null, 2)}

PRODUCTOS MENOS RENTABLES:
${JSON.stringify(menosRentables, null, 2)}

RENTABILIDAD POR CATEGORÍA:
${JSON.stringify(Object.values(rentabilidadPorCategoria), null, 2)}

Responde ÚNICAMENTE con JSON válido sin backticks. Usa punto como decimal. Máximo 80 chars por campo de texto:
{
  "resumen": "análisis financiero conciso con los números reales",
  "margenGeneral": numero,
  "categoriasMasRentables": ["cat1", "cat2", "cat3"],
  "alertas": [
    {
      "tipo": "CRITICO|ADVERTENCIA|OPORTUNIDAD",
      "titulo": "título corto",
      "descripcion": "descripción con números reales",
      "accion": "acción concreta"
    }
  ],
  "recomendaciones": [
    {
      "titulo": "título corto",
      "descripcion": "recomendación específica",
      "impactoEstimado": "impacto en Bs. o porcentaje"
    }
  ]
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
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message)

    const texto = data.content?.[0]?.text || ""
    const textoLimpio = texto.replace(/```json/g, "").replace(/```/g, "").trim()
    const analisis = JSON.parse(textoLimpio)

    return NextResponse.json({
      analisis,
      topRentables,
      menosRentables,
      rentabilidadPorCategoria: Object.values(rentabilidadPorCategoria),
      totalIngreso,
      totalGanancia,
      margenGeneral,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error en análisis" }, { status: 500 })
  }
}