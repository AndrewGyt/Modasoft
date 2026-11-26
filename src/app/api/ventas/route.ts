import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"
const USUARIO_EMAIL = "andre_rf97@hotmail.com"

async function getUsuarioId(): Promise<string> {
  const usuario = await db.usuario.findFirst({
    where: { tenantId: TENANT_ID, email: USUARIO_EMAIL },
  })
  if (usuario) return usuario.id

  // Si no existe, crearlo (primera vez)
  const nuevo = await db.usuario.create({
    data: {
      tenantId: TENANT_ID,
      nombre: "Andre",
      email: USUARIO_EMAIL,
      rol: "ADMIN",
    },
  })
  return nuevo.id
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
    const usuarioId = await getUsuarioId()
    const body = await req.json()

    // Resolver cliente: usar clienteId si viene, o crear uno nuevo si viene nombre
    let clienteId: string | undefined = body.clienteId || undefined
    if (!clienteId && body.clienteNombre?.trim()) {
      const nuevo = await db.cliente.create({
        data: {
          tenantId: TENANT_ID,
          nombre: body.clienteNombre.trim(),
          telefono: body.clienteTelefono || null,
        },
      })
      clienteId = nuevo.id
    }

    const venta = await db.venta.create({
      data: {
        tenantId: TENANT_ID,
        usuarioId: usuarioId,
        total: body.total,
        descuento: body.descuento || 0,
        metodoPago: body.metodoPago,
        ...(clienteId && { clienteId }),
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