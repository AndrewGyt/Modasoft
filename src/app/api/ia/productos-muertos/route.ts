import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function GET() {
  try {
    const hoy = new Date()
    const inicio90Dias = new Date(hoy.getTime() - 90 * 24 * 60 * 60 * 1000)

    const [variantes, detallesVentas] = await Promise.all([
      db.variante.findMany({
        where: { producto: { tenantId: TENANT_ID }, stockActual: { gt: 0 } },
        include: { producto: { include: { categoria: true } } },
      }),
      db.detalleVenta.findMany({
        where: { venta: { tenantId: TENANT_ID, createdAt: { gte: inicio90Dias } } },
        include: { venta: { select: { createdAt: true } } },
      }),
    ])

    const variantesConVentas = new Set(detallesVentas.map((d) => d.varianteId))

    const productosMuertos = variantes
      .filter((v) => !variantesConVentas.has(v.id))
      .map((v) => ({
        varianteId: v.id,
        producto: v.producto.nombre,
        categoria: v.producto.categoria.nombre,
        talla: v.talla,
        color: v.color,
        stockActual: v.stockActual,
        precioVenta: v.producto.precioVenta,
        precioCompra: v.producto.precioCompra,
        margen: ((v.producto.precioVenta - v.producto.precioCompra) / v.producto.precioVenta * 100).toFixed(1),
      }))

    const prompt = `Eres experto en retail de moda boliviana. Estos productos llevan 90+ días sin venderse en Tendance y tienen stock disponible. Sugiere estrategias de liquidación específicas.

PRODUCTOS SIN MOVIMIENTO:
${JSON.stringify(productosMuertos, null, 2)}

Responde ÚNICAMENTE con JSON válido sin backticks. Usa punto como decimal:
{
  "resumen": "texto corto con el impacto en el negocio",
  "productos": [
    {
      "varianteId": "id exacto",
      "producto": "nombre",
      "estrategia": "DESCUENTO|COMBO|SHOWCASE|DEVOLVER",
      "descuentoSugerido": numero entre 0 y 100,
      "precioSugerido": numero,
      "razon": "razón corta max 80 chars",
      "urgencia": "ALTA|MEDIA|BAJA"
    }
  ],
  "capitalInmovilizado": numero,
  "accionPrioritaria": "texto corto con la acción más urgente"
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

    return NextResponse.json({ analisis, productosMuertos })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error analizando productos" }, { status: 500 })
  }
}