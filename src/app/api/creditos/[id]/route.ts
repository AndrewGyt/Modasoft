import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const credito = await db.credito.findUnique({
      where: { id },
      include: {
        cliente: true,
        venta: {
          include: {
            detalles: {
              include: {
                variante: {
                  include: { producto: true },
                },
              },
            },
          },
        },
        pagos: { orderBy: { createdAt: "asc" } },
      },
    })

    if (!credito) {
      return NextResponse.json({ error: "Crédito no encontrado" }, { status: 404 })
    }

    return NextResponse.json(credito)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener crédito" }, { status: 500 })
  }
}
