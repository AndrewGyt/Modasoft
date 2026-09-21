import { db } from "@/lib/db"
import Link from "next/link"
import { Truck } from "lucide-react"

export default async function ProveedoresPage() {
  const proveedores = await db.proveedor.findMany({
    where: { tenantId: "tendance-001" },
    orderBy: { nombre: "asc" },
    include: { _count: { select: { productos: true, ordenes: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Proveedores
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {proveedores.length} proveedores registrados
          </p>
        </div>
        <Link
          href="/proveedores/nuevo"
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          + Nuevo proveedor
        </Link>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Nombre</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Contacto</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>País</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Lead time</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Productos</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Órdenes</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12" style={{ color: "var(--muted-foreground)" }}>
                  <Truck size={32} className="mx-auto mb-2 opacity-40" />
                  <p>No hay proveedores registrados</p>
                </td>
              </tr>
            ) : (
              proveedores.map((p) => (
                <tr key={p.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                    {p.nombre}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {p.contacto || "-"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {p.pais || "-"}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: "var(--muted-foreground)" }}>
                    {p.leadTimeDias} días
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: "var(--foreground)" }}>
                    {p._count.productos}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: "var(--foreground)" }}>
                    {p._count.ordenes}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}