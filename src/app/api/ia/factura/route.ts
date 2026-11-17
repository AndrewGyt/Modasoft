import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const isPdf = file.type === "application/pdf"

    // Si es PDF, usamos document type; si es imagen, image type
    const content: Anthropic.MessageParam["content"] = isPdf
      ? [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          } as never,
          {
            type: "text",
            text: `Analiza esta factura brasileña y extrae TODOS los productos.
Devuelve ÚNICAMENTE un JSON válido con este formato exacto, sin texto adicional:
{
  "productos": [
    {
      "descripcion": "nombre del producto",
      "codigo": "código de referencia si existe",
      "precioUnitario": 0.00,
      "cantidad": 0
    }
  ],
  "subtotal": 0.00,
  "moneda": "BRL"
}
Extrae todos los artículos de la factura. Los precios deben ser números sin símbolo de moneda.`,
          },
        ]
      : [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: file.type as "image/jpeg" | "image/png" | "image/webp",
              data: base64,
            },
          },
          {
            type: "text",
            text: `Analiza esta factura brasileña y extrae TODOS los productos.
Devuelve ÚNICAMENTE un JSON válido con este formato exacto, sin texto adicional:
{
  "productos": [
    {
      "descripcion": "nombre del producto",
      "codigo": "código de referencia si existe",
      "precioUnitario": 0.00,
      "cantidad": 0
    }
  ],
  "subtotal": 0.00,
  "moneda": "BRL"
}
Extrae todos los artículos de la factura. Los precios deben ser números sin símbolo de moneda.`,
          },
        ]

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content }],
    })

    const responseText = (message.content[0] as { type: string; text: string }).text

    // Limpiar respuesta y parsear JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "No se pudo extraer datos de la factura" }, { status: 422 })
    }

    const datos = JSON.parse(jsonMatch[0])
    return NextResponse.json(datos)
  } catch (error) {
    console.error("Error procesando factura:", error)
    return NextResponse.json({ error: "Error al procesar la factura" }, { status: 500 })
  }
}