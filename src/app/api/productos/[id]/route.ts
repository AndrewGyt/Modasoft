import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const producto = await db.producto.findUnique({
    where: { id },
    include: { categoria: true, proveedor: true, variantes: true },
  })
  if (!producto) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(producto)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    let categoria = await db.categoria.findFirst({
      where: { nombre: body.categoria, tenantId: TENANT_ID },
    })
    if (!categoria) {
      categoria = await db.categoria.create({
        data: { nombre: body.categoria, tenantId: TENANT_ID },
      })
    }

    const producto = await db.producto.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        sku: body.sku,
        precioCompra: parseFloat(body.precioCompra),
        precioVenta: parseFloat(body.precioVenta),
        temporada: body.temporada || null,
        categoriaId: categoria.id,
      },
    })

    return NextResponse.json(producto)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.variante.deleteMany({ where: { productoId: id } })
    await db.producto.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}