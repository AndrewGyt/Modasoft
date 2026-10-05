import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

export async function GET() {
  const proveedores = await db.proveedor.findMany({
    where: { tenantId: TENANT_ID },
    orderBy: { nombre: "asc" },
  })
  return NextResponse.json(proveedores)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const proveedor = await db.proveedor.create({
      data: {
        tenantId: TENANT_ID,
        nombre: body.nombre,
        contacto: body.contacto || null,
        pais: body.pais || null,
        leadTimeDias: parseInt(body.leadTimeDias) || 7,
      },
    })
    return NextResponse.json(proveedor)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear proveedor" }, { status: 500 })
  }
}