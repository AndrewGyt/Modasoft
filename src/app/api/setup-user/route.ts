import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

// Ruta temporal para crear usuario - eliminar después de usar
export async function GET() {
  try {
    const email = "fiorilovero@gmail.com"
    const password = "Tienda2026!"
    const hash = await bcrypt.hash(password, 12)

    const existe = await db.user.findUnique({ where: { email } })

    if (existe) {
      await db.user.update({
        where: { email },
        data: { password: hash, role: "VENDEDOR", tenantId: "tendance-001" },
      })
      return NextResponse.json({ ok: true, accion: "actualizado", email })
    } else {
      await db.user.create({
        data: {
          id: `user-fiori-${Date.now()}`,
          name: "Fiori",
          email,
          password: hash,
          role: "VENDEDOR",
          tenantId: "tendance-001",
        },
      })
      return NextResponse.json({ ok: true, accion: "creado", email })
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
