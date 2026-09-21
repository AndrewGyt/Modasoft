import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const orden = await db.ordenCompra.update({
      where: { id },
      data: { estado: body.estado },
    })

    if (body.estado === "RECIBIDA") {
      const detalles = await db.detalleOrdenCompra.findMany({
        where: { ordenId: id },
      })
      await Promise.all(
        detalles.map((d) =>
          db.variante.update({
            where: { id: d.varianteId },
            data: { stockActual: { increment: d.cantidad } },
          })
        )
      )
    }

    return NextResponse.json(orden)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar orden" }, { status: 500 })
  }
}