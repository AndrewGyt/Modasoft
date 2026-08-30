import { db } from "@/lib/db"
import { Package, AlertTriangle } from "lucide-react"

export default async function InventarioPage() {
  const variantes = await db.variante.findMany({
    include: {
      producto: {
        include: {
          categoria: true,
          proveedor: true,
        },
      },
    },
    orderBy: { producto: { nombre: "asc" } },
  })

  const stockBajo = variantes.filter(
    (v) => v.stockActual <= v.stockMinimo
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Inventario
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {variantes.length} variantes registradas
          </p>
        </div>
      </div>

      {stockBajo.length > 0 && (
        <div
          className="flex items-center gap-3 p-4 rounded-lg border"
          style={{ background: "var(--destructive)", borderColor: "var(--destructive)" }}
        >
          <AlertTriangle size={18} color="white" />
          <p className="text-sm font-medium text-white">
            {stockBajo.length} producto(s) con stock bajo
          </p>
        </div>
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Producto</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Categoría</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Talla</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Color</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Stock</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Mínimo</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Precio venta</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {variantes.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12" style={{ color: "var(--muted-foreground)" }}>
                  <Package size={32} className="mx-auto mb-2 opacity-40" />
                  <p>No hay productos en inventario</p>
                </td>
              </tr>
            ) : (
              variantes.map((v) => {
                const stockBajo = v.stockActual <= v.stockMinimo
                return (
                  <tr
                    key={v.id}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                      {v.producto.nombre}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                      {v.producto.categoria.nombre}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                      {v.talla}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                      {v.color}
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--foreground)" }}>
                      {v.stockActual}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: "var(--muted-foreground)" }}>
                      {v.stockMinimo}
                    </td>
                    <td className="px-4 py-3 text-right" style={{ color: "var(--foreground)" }}>
                      Bs. {v.producto.precioVenta.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: stockBajo ? "var(--destructive)" : "var(--primary)",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        {stockBajo ? "Stock bajo" : "OK"}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}