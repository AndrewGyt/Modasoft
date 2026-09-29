import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function GET() {
  const creditos = await db.credito.findMany({
    where: { tenantId: TENANT_ID },
    include: {
      cliente: true,
      venta: true,
      pagos: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  })

  const hoy = new Date()
  const creditosActualizados = await Promise.all(
    creditos.map(async (c) => {
      if (c.estado !== "PAGADO" && new Date(c.fechaVencimiento) < hoy) {
        await db.credito.update({
          where: { id: c.id },
          data: { estado: "VENCIDO" },
        })
        return { ...c, estado: "VENCIDO" }
      }
      return c
    })
  )

  return NextResponse.json(creditosActualizados)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    let cliente = await db.cliente.findFirst({
      where: { tenantId: TENANT_ID, nombre: body.clienteNombre },
    })

    if (!cliente) {
      cliente = await db.cliente.create({
        data: {
          tenantId: TENANT_ID,
          nombre: body.clienteNombre,
          telefono: body.clienteTelefono || null,
        },
      })
    }

    const montoPagadoInicial = parseFloat(body.montoPagado) || 0

    const credito = await db.credito.create({
      data: {
        tenantId: TENANT_ID,
        clienteId: cliente.id,
        ventaId: body.ventaId,
        montoTotal: body.montoTotal,
        montoPagado: montoPagadoInicial,
        fechaVencimiento: new Date(body.fechaVencimiento),
        notas: body.notas || null,
        estado: montoPagadoInicial >= body.montoTotal ? "PAGADO" : montoPagadoInicial > 0 ? "PARCIAL" : "PENDIENTE",
        pagos: montoPagadoInicial > 0 ? {
          create: {
            monto: montoPagadoInicial,
            metodoPago: "efectivo",
            notas: "Abono inicial al momento de la venta",
          },
        } : undefined,
      },
    })

    return NextResponse.json(credito)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear crédito" }, { status: 500 })
  }
}