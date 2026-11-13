import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""

  const clientes = await db.cliente.findMany({
    where: {
      tenantId: TENANT_ID,
      ...(q && {
        OR: [
          { nombre: { contains: q, mode: "insensitive" } },
          { telefono: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      ventas: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { detalles: { include: { variante: { include: { producto: true } } } } },
      },
      creditos: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { nombre: "asc" },
  })

  return NextResponse.json(clientes)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cliente = await db.cliente.create({
      data: {
        tenantId: TENANT_ID,
        nombre: body.nombre,
        telefono: body.telefono || null,
        email: body.email || null,
      },
    })
    return NextResponse.json(cliente)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 })
  }
}
