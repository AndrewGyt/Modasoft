"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    sku: "",
    precioCompra: "",
    precioVenta: "",
    temporada: "",
    categoria: "",
    talla: "",
    color: "",
    stockActual: "",
    stockMinimo: "5",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push("/inventario")
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
    width: "100%",
    fontSize: "14px",
  }

  const labelStyle = {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--muted-foreground)",
    display: "block",
    marginBottom: "6px",
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Nuevo producto
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Agrega un producto al inventario de Tendance
        </p>
      </div>

      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="font-medium" style={{ color: "var(--foreground)" }}>Información del producto</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} style={inputStyle} placeholder="Ej: Blusa floral" />
          </div>
          <div>
            <label style={labelStyle}>SKU</label>
            <input name="sku" value={form.sku} onChange={handleChange} style={inputStyle} placeholder="Ej: BLU-001" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} style={{ ...inputStyle, minHeight: "80px" }} placeholder="Descripción opcional" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Categoría</label>
            <input name="categoria" value={form.categoria} onChange={handleChange} style={inputStyle} placeholder="Ej: Blusas" />
          </div>
          <div>
            <label style={labelStyle}>Temporada</label>
            <select name="temporada" value={form.temporada} onChange={handleChange} style={inputStyle}>
              <option value="">Todo el año</option>
              <option value="verano">Verano</option>
              <option value="invierno">Invierno</option>
              <option value="primavera">Primavera</option>
              <option value="otoño">Otoño</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Precio compra (Bs.)</label>
            <input name="precioCompra" type="number" value={form.precioCompra} onChange={handleChange} style={inputStyle} placeholder="0.00" />
          </div>
          <div>
            <label style={labelStyle}>Precio venta (Bs.)</label>
            <input name="precioVenta" type="number" value={form.precioVenta} onChange={handleChange} style={inputStyle} placeholder="0.00" />
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="font-medium" style={{ color: "var(--foreground)" }}>Variante inicial</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Talla</label>
            <select name="talla" value={form.talla} onChange={handleChange} style={inputStyle}>
              <option value="">Seleccionar</option>
              <option>XS</option>
              <option>S</option>
              <option>M</option>
              <option>L</option>
              <option>XL</option>
              <option>XXL</option>
              <option>Única</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Color</label>
            <input name="color" value={form.color} onChange={handleChange} style={inputStyle} placeholder="Ej: Negro" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Stock actual</label>
            <input name="stockActual" type="number" value={form.stockActual} onChange={handleChange} style={inputStyle} placeholder="0" />
          </div>
          <div>
            <label style={labelStyle}>Stock mínimo</label>
            <input name="stockMinimo" type="number" value={form.stockMinimo} onChange={handleChange} style={inputStyle} placeholder="5" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/inventario")}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--secondary)",
            color: "var(--secondary-foreground)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Guardando..." : "Guardar producto"}
        </button>
      </div>
    </div>
  )
}