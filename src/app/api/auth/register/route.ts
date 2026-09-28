import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nombre, email, password } = body

    const existe = await db.user.findUnique({ where: { email } })
    if (existe) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)

    let tenant = await db.tenant.findUnique({ where: { id: "tendance-001" } })
    if (!tenant) {
      tenant = await db.tenant.create({
        data: { id: "tendance-001", nombre: "Tendance" },
      })
    }

    const user = await db.user.create({
      data: {
        name: nombre,
        email,
        password: hash,
        role: "ADMIN",
        tenantId: "tendance-001",
      },
    })

    return NextResponse.json({ ok: true, userId: user.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 })
  }
}