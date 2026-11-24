import { db } from "@/lib/db"
import InventarioClient from "./InventarioClient"

export const dynamic = "force-dynamic"

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

  return <InventarioClient variantes={variantes} />
}
