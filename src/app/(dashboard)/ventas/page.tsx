import { db } from "@/lib/db"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"

export default async function VentasPage() {
  const ventas = await db.venta.findMany({
    where: { tenantId: "tendance-001" },
    include: {
      detalles: { include: { variante: { include: { producto: true } } } },
      usuario: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const totalHoy = ventas
    .filter((v) => {
      const hoy = new Date()
      const fecha = new Date(v.createdAt)
      return fecha.toDateString() === hoy.toDateString()
    })
    .reduce((acc, v) => acc + v.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Ventas
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {ventas.length} ventas registradas
          </p>
        </div>
        <Link
          href="/ventas/nueva"
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
          + Nueva venta
        </Link>
      </div>

      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Ventas hoy</p>
        <p className="text-3xl font-bold mt-1" style={{ color: "var(--foreground)" }}>
          Bs. {totalHoy.toFixed(2)}
        </p>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Fecha</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Productos</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Método pago</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Descuento</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12" style={{ color: "var(--muted-foreground)" }}>
                  <ShoppingCart size={32} className="mx-auto mb-2 opacity-40" />
                  <p>No hay ventas registradas</p>
                </td>
              </tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(v.createdAt).toLocaleDateString("es-BO", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--foreground)" }}>
                    {v.detalles.map((d) => (
                      <span key={d.id} className="block">
                        {d.variante.producto.nombre} x{d.cantidad}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                    {v.metodoPago}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: "var(--muted-foreground)" }}>
                    {v.descuento > 0 ? `Bs. ${v.descuento.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--foreground)" }}>
                    Bs. {v.total.toFixed(2)}
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