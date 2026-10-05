import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function GET() {
  try {
    const hoy = new Date()
    const mesActual = hoy.getMonth()
    const anioActual = hoy.getFullYear()

    const ventas = await db.detalleVenta.findMany({
      where: { venta: { tenantId: TENANT_ID } },
      include: {
        venta: { select: { createdAt: true } },
        variante: {
          include: {
            producto: { include: { categoria: true } },
          },
        },
      },
    })

    const ventasPorMesCategoria: Record<string, Record<string, number>> = {}

    ventas.forEach((d) => {
      const fecha = new Date(d.venta.createdAt)
      const mes = fecha.toLocaleDateString("es-BO", { month: "long", year: "numeric" })
      const cat = d.variante.producto.categoria.nombre

      if (!ventasPorMesCategoria[mes]) ventasPorMesCategoria[mes] = {}
      ventasPorMesCategoria[mes][cat] = (ventasPorMesCategoria[mes][cat] || 0) + d.cantidad * d.precioUnitario
    })

    const mesesSiguientes = Array.from({ length: 3 }, (_, i) => {
      const fecha = new Date(anioActual, mesActual + i + 1, 1)
      return fecha.toLocaleDateString("es-BO", { month: "long", year: "numeric" })
    })

    const prompt = `Eres experto en retail de moda femenina en Bolivia (Cochabamba). Analiza el historial de ventas de Tendance y predice las tendencias para los próximos 3 meses. IMPORTANTE: Sé muy conciso. Máximo 3 predicciones, máximo 3 categorias por predicción, textos de máximo 80 caracteres por campo. No uses caracteres especiales como comillas dentro de los strings.

CONTEXTO BOLIVIA:
- Noviembre-Diciembre: temporada de fiestas, fin de año, graduaciones
- Enero-Febrero: verano, vacaciones
- Marzo-Abril: regreso a clases
- Mayo-Junio: fiestas patrias, temporada de frío
- Julio-Agosto: invierno pico
- Septiembre-Octubre: primavera, fiestas universitarias

HISTORIAL DE VENTAS POR MES Y CATEGORÍA:
${JSON.stringify(ventasPorMesCategoria, null, 2)}

PRÓXIMOS 3 MESES A PREDECIR: ${mesesSiguientes.join(", ")}

Responde ÚNICAMENTE con JSON válido sin backticks. Usa punto como decimal:
{
  "resumen": "análisis del patrón estacional detectado",
  "predicciones": [
    {
      "mes": "nombre del mes",
      "categoriaEstrella": "categoría con mayor potencial",
      "ventasEstimadas": numero,
      "tendencia": "CRECIENTE|ESTABLE|DECRECIENTE",
      "recomendacion": "acción concreta para ese mes",
      "categorias": [
        {
          "nombre": "nombre categoria",
          "prediccion": "SUBE|ESTABLE|BAJA",
          "razon": "razón corta"
        }
      ]
    }
  ],
  "alertaTemporada": "alerta específica para prepararse",
  "accionInmediata": "qué hacer esta semana"
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
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message)

    const texto = data.content?.[0]?.text || ""
    const textoLimpio = texto.replace(/```json/g, "").replace(/```/g, "").trim()
    const prediccion = JSON.parse(textoLimpio)

    return NextResponse.json({ prediccion, mesesSiguientes })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error en predicción" }, { status: 500 })
  }
}