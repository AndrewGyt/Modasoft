import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const credito = await db.credito.findUnique({
      where: { id },
      include: { pagos: true },
    })

    if (!credito) {
      return NextResponse.json({ error: "Crédito no encontrado" }, { status: 404 })
    }

    const montoPendiente = credito.montoTotal - credito.montoPagado
    const montoIngresado = parseFloat(body.monto)

    if (montoIngresado <= 0) {
      return NextResponse.json({ error: "El monto debe ser mayor a 0" }, { status: 400 })
    }

    if (montoIngresado > montoPendiente) {
      return NextResponse.json({
        error: `El monto no puede ser mayor al saldo pendiente (Bs. ${montoPendiente.toFixed(2)})`,
      }, { status: 400 })
    }

    const pago = await db.pagoCredito.create({
      data: {
        creditoId: id,
        monto: montoIngresado,
        metodoPago: body.metodoPago,
        notas: body.notas || null,
      },
    })

    const totalPagado = credito.pagos.reduce((acc, p) => acc + p.monto, 0) + montoIngresado
    const estado = totalPagado >= credito.montoTotal ? "PAGADO" : "PARCIAL"

    await db.credito.update({
      where: { id },
      data: { montoPagado: totalPagado, estado },
    })

    return NextResponse.json(pago)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al registrar pago" }, { status: 500 })
  }
}
