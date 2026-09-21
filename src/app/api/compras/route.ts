import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function GET() {
  const ordenes = await db.ordenCompra.findMany({
    where: { tenantId: TENANT_ID },
    include: {
      proveedor: true,
      detalles: {
        include: {
          variante: {
            include: { producto: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(ordenes)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const orden = await db.ordenCompra.create({
      data: {
        tenantId: TENANT_ID,
        proveedorId: body.proveedorId,
        fechaEsperada: body.fechaEsperada ? new Date(body.fechaEsperada) : null,
        total: body.total,
        notas: body.notas || null,
        estado: "PENDIENTE",
        detalles: {
          create: body.items.map((item: any) => ({
            varianteId: item.varianteId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          })),
        },
      },
    })
    return NextResponse.json(orden)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear orden" }, { status: 500 })
  }
}