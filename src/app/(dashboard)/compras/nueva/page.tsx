"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

interface Proveedor { id: string; nombre: string; leadTimeDias: number }
interface Variante {
  id: string; talla: string; color: string; stockActual: number
  producto: { nombre: string; precioCompra: number }
}
interface ItemOrden {
  varianteId: string; nombre: string; talla: string; color: string
  precioUnitario: number; cantidad: number
}

export default function NuevaCompraPage() {
  const router = useRouter()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [variantes, setVariantes] = useState<Variante[]>([])
  const [proveedorId, setProveedorId] = useState("")
  const [items, setItems] = useState<ItemOrden[]>([])
  const [fechaEsperada, setFechaEsperada] = useState("")
  const [notas, setNotas] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/proveedores").then((r) => r.json()).then(setProveedores)
    fetch("/api/productos").then((r) => r.json()).then((productos) => {
      const vars: Variante[] = []
      productos.forEach((p: any) => {
        p.variantes.forEach((v: any) => {
          vars.push({
            ...v,
            producto: { nombre: p.nombre, precioCompra: p.precioCompra },
          })
        })
      })
      setVariantes(vars)
    })
  }, [])

  const variantesFiltradas = variantes.filter((v) =>
    v.producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.talla.toLowerCase().includes(busqueda.toLowerCase())
  )

  const agregarItem = (v: Variante) => {
    const existe = items.find((i) => i.varianteId === v.id)
    if (existe) {
      setItems(items.map((i) => i.varianteId === v.id ? { ...i, cantidad: i.cantidad + 1 } : i))
    } else {
      setItems([...items, {
        varianteId: v.id,
        nombre: v.producto.nombre,
        talla: v.talla,
        color: v.color,
        precioUnitario: v.producto.precioCompra,
        cantidad: 1,
      }])
    }
  }

  const total = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)

  const handleSubmit = async () => {
    if (!proveedorId || items.length === 0) return
    setLoading(true)
    try {
      const res = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proveedorId, items, total, fechaEsperada, notas }),
      })
      if (res.ok) router.push("/compras")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: "var(--input)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--foreground)",
    padding: "8px 12px",
    fontSize: "14px",
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Nueva orden de compra
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
              Proveedor
            </label>
            <select
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            >
              <option value="">Seleccionar proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
              Fecha esperada de entrega
            </label>
            <input
              type="date"
              value={fechaEsperada}
              onChange={(e) => setFechaEsperada(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            />
          </div>
        </div>

        <input
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ ...inputStyle, width: "100%" }}
        />

        <div className="grid grid-cols-2 gap-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 340px)" }}>
          {variantesFiltradas.map((v) => (
            <button
              key={v.id}
              onClick={() => agregarItem(v)}
              style={{
                padding: "14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--card)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                {v.producto.nombre}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {v.talla} · {v.color} · Stock: {v.stockActual}
              </p>
              <p className="text-sm font-bold mt-1" style={{ color: "var(--foreground)" }}>
                Bs. {v.producto.precioCompra.toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div
        className="w-80 flex flex-col rounded-xl border p-5 gap-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
          Orden
        </h2>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--muted-foreground)" }}>
              Selecciona productos
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.varianteId}
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{ background: "var(--muted)" }}
              >
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                    {item.nombre}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {item.talla} · {item.color}
                  </p>
                  <p className="text-xs font-bold mt-1" style={{ color: "var(--foreground)" }}>
                    Bs. {(item.precioUnitario * item.cantidad).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setItems(items.map((i) => i.varianteId === item.varianteId ? { ...i, cantidad: Math.max(1, i.cantidad - 1) } : i))}
                    style={{ ...inputStyle, padding: "2px 8px", cursor: "pointer" }}
                  >-</button>
                  <span className="text-sm w-6 text-center" style={{ color: "var(--foreground)" }}>
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => setItems(items.map((i) => i.varianteId === item.varianteId ? { ...i, cantidad: i.cantidad + 1 } : i))}
                    style={{ ...inputStyle, padding: "2px 8px", cursor: "pointer" }}
                  >+</button>
                </div>
                <button onClick={() => setItems(items.filter((i) => i.varianteId !== item.varianteId))}>
                  <Trash2 size={14} color="var(--destructive)" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
              Notas
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              style={{ ...inputStyle, width: "100%", minHeight: "60px" }}
              placeholder="Instrucciones al proveedor..."
            />
          </div>

          <div className="flex justify-between font-bold" style={{ color: "var(--foreground)" }}>
            <span>Total</span>
            <span>Bs. {total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={items.length === 0 || !proveedorId || loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: items.length === 0 || !proveedorId ? "var(--muted)" : "var(--primary)",
              color: items.length === 0 || !proveedorId ? "var(--muted-foreground)" : "var(--primary-foreground)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: items.length === 0 || !proveedorId || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Guardando..." : "Crear orden"}
          </button>
        </div>
      </div>
    </div>
  )
}