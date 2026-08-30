import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const TENANT_ID = "tendance-001"

async function getTenant() {
  let tenant = await db.tenant.findUnique({
    where: { id: TENANT_ID },
  })

  if (!tenant) {
    tenant = await db.tenant.create({
      data: { id: TENANT_ID, nombre: "Tendance" },
    })
  }

  return tenant
}

export async function POST(req: Request) {
  try {
    await getTenant()

    const body = await req.json()

    let categoria = await db.categoria.findFirst({
      where: { nombre: body.categoria, tenantId: TENANT_ID },
    })

    if (!categoria) {
      categoria = await db.categoria.create({
        data: { nombre: body.categoria, tenantId: TENANT_ID },
      })
    }

    let proveedor = await db.proveedor.findFirst({
      where: { tenantId: TENANT_ID },
    })

    if (!proveedor) {
      proveedor = await db.proveedor.create({
        data: { nombre: "Proveedor general", tenantId: TENANT_ID },
      })
    }

    const producto = await db.producto.create({
      data: {
        tenantId: TENANT_ID,
        categoriaId: categoria.id,
        proveedorId: proveedor.id,
        nombre: body.nombre,
        descripcion: body.descripcion,
        sku: body.sku,
        precioCompra: parseFloat(body.precioCompra),
        precioVenta: parseFloat(body.precioVenta),
        temporada: body.temporada || null,
        variantes: {
          create: {
            talla: body.talla,
            color: body.color,
            stockActual: parseInt(body.stockActual),
            stockMinimo: parseInt(body.stockMinimo),
          },
        },
      },
    })

    return NextResponse.json(producto)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}