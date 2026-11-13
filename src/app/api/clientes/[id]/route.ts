import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const cliente = await db.cliente.update({
      where: { id },
      data: {
        nombre: body.nombre,
        telefono: body.telefono || null,
        email: body.email || null,
      },
    })
    return NextResponse.json(cliente)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.cliente.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 500 })
  }
}
