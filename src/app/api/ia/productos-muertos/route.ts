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

    // Limitar a 50 productos para no exceder tokens
    const productosMuertosLimitados = productosMuertos.slice(0, 50)

    const prompt = `Eres experto en retail de moda boliviana. Estos productos llevan 90+ días sin venderse en Tendance y tienen stock disponible. Sugiere estrategias de liquidación específicas.

PRODUCTOS SIN MOVIMIENTO (${productosMuertosLimitados.length} items):
${JSON.stringify(productosMuertosLimitados.map(p => ({
  id: p.varianteId,
  producto: p.producto,
  cat: p.categoria,
  talla: p.talla,
  color: p.color,
  stock: p.stockActual,
  pvp: p.precioVenta,
  costo: p.precioCompra,
})), null, 1)}

Responde ÚNICAMENTE con JSON válido sin backticks ni markdown. Usa punto como decimal. Sé conciso en los textos:
{"resumen":"texto","productos":[{"varianteId":"id","estrategia":"DESCUENTO|COMBO|SHOWCASE|DEVOLVER","descuentoSugerido":0,"precioSugerido":0,"razon":"max 60 chars","urgencia":"ALTA|MEDIA|BAJA"}],"capitalInmovilizado":0,"accionPrioritaria":"texto"}`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message)

    const stopReason = data.stop_reason
    const texto = data.content?.[0]?.text || ""
    if (stopReason === "max_tokens") {
      console.warn("Respuesta IA truncada — intentando reparar JSON")
    }

    const textoLimpio = texto.replace(/```json/g, "").replace(/```/g, "").trim()

    let analisis
    try {
      analisis = JSON.parse(textoLimpio)
    } catch {
      const corte = textoLimpio.lastIndexOf("},")
      if (corte !== -1) {
        const reparado = textoLimpio.slice(0, corte + 1) + "]}"
        analisis = JSON.parse(reparado)
      } else {
        throw new Error("JSON de IA inválido y no reparable")
      }
    }

    return NextResponse.json({ analisis, productosMuertos, totalSinAnalisis: productosMuertos.length - productosMuertosLimitados.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error analizando productos" }, { status: 500 })
  }
}