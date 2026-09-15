"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

interface Variante {
  id: string
  talla: string
  color: string
  stockActual: number
  producto: {
    id: string
    nombre: string
    precioVenta: number
    categoria: { nombre: string }
  }
}

interface ItemCarrito {
  varianteId: string
  nombre: string
  talla: string
  color: string
  precioUnitario: number
  cantidad: number
  stockDisponible: number
}

export default function NuevaVentaPage() {
  const router = useRouter()
  const [variantes, setVariantes] = useState<Variante[]>([])
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [descuento, setDescuento] = useState(0)
  const [metodoPago, setMetodoPago] = useState("efectivo")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => r.json())
      .then((productos) => {
        const todasVariantes: Variante[] = []
        productos.forEach((p: any) => {
          p.variantes.forEach((v: any) => {
            todasVariantes.push({
              ...v,
              producto: {
                id: p.id,
                nombre: p.nombre,
                precioVenta: p.precioVenta,
                categoria: p.categoria,
              },
            })
          })
        })
        setVariantes(todasVariantes)
      })
  }, [])

  const variantesFiltradas = variantes.filter(
    (v) =>
      v.producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.talla.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.color.toLowerCase().includes(busqueda.toLowerCase())
  )

  const agregarAlCarrito = (v: Variante) => {
    const existe = carrito.find((i) => i.varianteId === v.id)
    if (existe) {
      if (existe.cantidad >= v.stockActual) return
      setCarrito(carrito.map((i) =>
        i.varianteId === v.id ? { ...i, cantidad: i.cantidad + 1 } : i
      ))
    } else {
      setCarrito([...carrito, {
        varianteId: v.id,
        nombre: v.producto.nombre,
        talla: v.talla,
        color: v.color,
        precioUnitario: v.producto.precioVenta,
        cantidad: 1,
        stockDisponible: v.stockActual,
      }])
    }
  }

  const quitarDelCarrito = (varianteId: string) => {
    setCarrito(carrito.filter((i) => i.varianteId !== varianteId))
  }

  const cambiarCantidad = (varianteId: string, cantidad: number) => {
    if (cantidad < 1) return
    const item = carrito.find((i) => i.varianteId === varianteId)
    if (item && cantidad > item.stockDisponible) return
    setCarrito(carrito.map((i) =>
      i.varianteId === varianteId ? { ...i, cantidad } : i
    ))
  }

  const subtotal = carrito.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
  const total = Math.max(0, subtotal - descuento)

  const handleRegistrarVenta = async () => {
    if (carrito.length === 0) return
    setLoading(true)
    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: carrito.map((i) => ({
            varianteId: i.varianteId,
            cantidad: i.cantidad,
            precioUnitario: i.precioUnitario,
          })),
          total,
          descuento,
          metodoPago,
        }),
      })
      if (res.ok) router.push("/ventas")
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
    <div className="flex gap-6 h-full">
      <div className="flex-1 space-y-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Nueva venta
        </h1>

        <input
          placeholder="Buscar producto, talla o color..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ ...inputStyle, width: "100%" }}
        />

        <div className="grid grid-cols-2 gap-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
          {variantesFiltradas.map((v) => (
            <button
              key={v.id}
              onClick={() => agregarAlCarrito(v)}
              disabled={v.stockActual === 0}
              style={{
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--card)",
                cursor: v.stockActual === 0 ? "not-allowed" : "pointer",
                opacity: v.stockActual === 0 ? 0.5 : 1,
                textAlign: "left",
              }}
            >
              <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                {v.producto.nombre}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {v.talla} · {v.color} · Stock: {v.stockActual}
              </p>
              <p className="text-sm font-bold mt-2" style={{ color: "var(--foreground)" }}>
                Bs. {v.producto.precioVenta.toFixed(2)}
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
          Carrito
        </h2>

        <div className="flex-1 space-y-3 overflow-y-auto">
          {carrito.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--muted-foreground)" }}>
              Selecciona productos
            </p>
          ) : (
            carrito.map((item) => (
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
                    onClick={() => cambiarCantidad(item.varianteId, item.cantidad - 1)}
                    style={{ ...inputStyle, padding: "2px 8px", cursor: "pointer" }}
                  >-</button>
                  <span className="text-sm w-6 text-center" style={{ color: "var(--foreground)" }}>
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => cambiarCantidad(item.varianteId, item.cantidad + 1)}
                    style={{ ...inputStyle, padding: "2px 8px", cursor: "pointer" }}
                  >+</button>
                </div>
                <button onClick={() => quitarDelCarrito(item.varianteId)}>
                  <Trash2 size={14} color="var(--destructive)" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex justify-between text-sm" style={{ color: "var(--muted-foreground)" }}>
            <span>Subtotal</span>
            <span>Bs. {subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Descuento</span>
            <input
              type="number"
              value={descuento}
              onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
              style={{ ...inputStyle, width: "90px", textAlign: "right" }}
            />
          </div>

          <div className="flex justify-between font-bold" style={{ color: "var(--foreground)" }}>
            <span>Total</span>
            <span>Bs. {total.toFixed(2)}</span>
          </div>

          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="qr">QR</option>
            <option value="tarjeta">Tarjeta</option>
          </select>

          <button
            onClick={handleRegistrarVenta}
            disabled={carrito.length === 0 || loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: carrito.length === 0 ? "var(--muted)" : "var(--primary)",
              color: carrito.length === 0 ? "var(--muted-foreground)" : "var(--primary-foreground)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: carrito.length === 0 || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Registrando..." : "Registrar venta"}
          </button>
        </div>
      </div>
    </div>
  )
}