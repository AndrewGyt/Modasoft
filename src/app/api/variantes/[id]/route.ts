import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const variante = await db.variante.update({
      where: { id },
      data: {
        talla: body.talla,
        color: body.color,
        stockActual: parseInt(body.stockActual),
        stockMinimo: parseInt(body.stockMinimo),
      },
    })
    return NextResponse.json(variante)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar variante" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.variante.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al eliminar variante" }, { status: 500 })
  }
}