import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"
const USUARIO_ID = "usuario-demo"

async function getUsuario() {
  let usuario = await db.usuario.findUnique({ where: { id: USUARIO_ID } })
  if (!usuario) {
    usuario = await db.usuario.create({
      data: {
        id: USUARIO_ID,
        tenantId: TENANT_ID,
        nombre: "Andre",
        email: "andre_rf97@hotmail.com",
        rol: "ADMIN",
      },
    })
  }
  return usuario
}

export async function GET() {
  const ventas = await db.venta.findMany({
    where: { tenantId: TENANT_ID },
    include: {
      detalles: {
        include: {
          variante: {
            include: { producto: true },
          },
        },
      },
      usuario: true,
      cliente: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(ventas)
}

export async function POST(req: Request) {
  try {
    await getUsuario()
    const body = await req.json()

    const venta = await db.venta.create({
      data: {
        tenantId: TENANT_ID,
        usuarioId: USUARIO_ID,
        total: body.total,
        descuento: body.descuento || 0,
        metodoPago: body.metodoPago,
        detalles: {
          create: body.items.map((item: any) => ({
            varianteId: item.varianteId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          })),
        },
      },
    })

    await Promise.all(
      body.items.map((item: any) =>
        db.variante.update({
          where: { id: item.varianteId },
          data: { stockActual: { decrement: item.cantidad } },
        })
      )
    )

    return NextResponse.json(venta)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al registrar venta" }, { status: 500 })
  }
}