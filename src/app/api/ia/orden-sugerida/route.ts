import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function GET() {
  try {
    const inicio90Dias = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    const [variantes, detallesVentas, proveedores] = await Promise.all([
      db.variante.findMany({
        where: { producto: { tenantId: TENANT_ID } },
        include: { producto: { include: { categoria: true, proveedor: true } } },
      }),
      db.detalleVenta.findMany({
        where: { venta: { tenantId: TENANT_ID, createdAt: { gte: inicio90Dias } } },
        include: { variante: { include: { producto: true } } },
      }),
      db.proveedor.findMany({ where: { tenantId: TENANT_ID } }),
    ])

    const ventasPorVariante: Record<string, number> = {}
    detallesVentas.forEach((d) => {
      ventasPorVariante[d.varianteId] = (ventasPorVariante[d.varianteId] || 0) + d.cantidad
    })

    const analisisProductos = variantes.map((v) => {
      const vendido90Dias = ventasPorVariante[v.id] || 0
      const velocidadDiaria = vendido90Dias / 90
      const diasHastaAgotamiento = velocidadDiaria > 0 ? v.stockActual / velocidadDiaria : 999
      const leadTime = v.producto.proveedor.leadTimeDias
      const necesitaReposicion = diasHastaAgotamiento <= leadTime * 1.5 || v.stockActual <= v.stockMinimo

      return {
        varianteId: v.id,
        producto: v.producto.nombre,
        categoria: v.producto.categoria.nombre,
        talla: v.talla,
        color: v.color,
        proveedor: v.producto.proveedor.nombre,
        proveedorId: v.producto.proveedorId,
        stockActual: v.stockActual,
        stockMinimo: v.stockMinimo,
        vendido90Dias,
        velocidadDiaria: parseFloat(velocidadDiaria.toFixed(3)),
        diasHastaAgotamiento: parseFloat(diasHastaAgotamiento.toFixed(1)),
        leadTimeDias: leadTime,
        necesitaReposicion,
        precioCompra: v.producto.precioCompra,
        precioVenta: v.producto.precioVenta,
      }
    })

    const productosParaReponer = analisisProductos
      .filter((p) => p.necesitaReposicion)
      .sort((a, b) => a.diasHastaAgotamiento - b.diasHastaAgotamiento)

    const prompt = `Eres un experto en gestión de inventario para tiendas de moda en Bolivia. Analiza estos productos que necesitan reposición y genera una orden de compra optimizada.

PRODUCTOS QUE NECESITAN REPOSICIÓN:
${JSON.stringify(productosParaReponer, null, 2)}

PROVEEDORES DISPONIBLES:
${JSON.stringify(proveedores.map(p => ({ id: p.id, nombre: p.nombre, leadTimeDias: p.leadTimeDias })), null, 2)}

Responde ÚNICAMENTE con JSON válido sin backticks. Usa punto como decimal, sin separadores de miles. Máximo 10 items en ordenItems:
{
  "resumen": "texto corto explicando la urgencia",
  "ordenItems": [
    {
      "varianteId": "id exacto del variante",
      "producto": "nombre del producto",
      "cantidadSugerida": numero,
      "razon": "razón corta (max 60 chars)",
      "urgencia": "ALTA|MEDIA|BAJA",
      "precioCompra": numero
    }
  ],
  "totalEstimado": numero,
  "proveedorRecomendado": "nombre del proveedor",
  "proveedorId": "id del proveedor"
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
    const orden = JSON.parse(textoLimpio)

    return NextResponse.json({ orden, productosParaReponer })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error generando orden" }, { status: 500 })
  }
}