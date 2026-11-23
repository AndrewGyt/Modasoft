import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

// Ruta temporal para crear/actualizar usuarios - eliminar después de usar
export async function GET() {
  const resultados = []

  const usuarios = [
    { email: "andre_rf97@hotmail.com", password: "Tendance2026!", name: "Andre", role: "ADMIN" },
    { email: "fiorilovero@gmail.com", password: "Tienda2026!", name: "Fiori", role: "ADMIN" },
    { email: "tienda@tendance.bo", password: "Tienda2026!", name: "Vendedor Tendance", role: "VENDEDOR" },
  ]

  for (const u of usuarios) {
    try {
      const hash = await bcrypt.hash(u.password, 12)
      const existe = await db.user.findUnique({ where: { email: u.email } })

      if (existe) {
        await db.user.update({
          where: { email: u.email },
          data: { password: hash, role: u.role as "ADMIN" | "VENDEDOR", tenantId: "tendance-001", name: u.name },
        })
        resultados.push({ email: u.email, accion: "actualizado", role: u.role })
      } else {
        await db.user.create({
          data: {
            id: `user-${u.email.split("@")[0]}-${Date.now()}`,
            name: u.name,
            email: u.email,
            password: hash,
            role: u.role as "ADMIN" | "VENDEDOR",
            tenantId: "tendance-001",
          },
        })
        resultados.push({ email: u.email, accion: "creado", role: u.role })
      }
    } catch (e) {
      resultados.push({ email: u.email, accion: "error", error: String(e) })
    }
  }

  return NextResponse.json({ ok: true, resultados })
}
