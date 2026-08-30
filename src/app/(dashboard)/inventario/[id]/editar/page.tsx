"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    sku: "",
    precioCompra: "",
    precioVenta: "",
    temporada: "",
    categoria: "",
  })
  const [variantes, setVariantes] = useState<any[]>([])

  useEffect(() => {
    if (!id) return
    fetch(`/api/productos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          nombre: data.nombre,
          descripcion: data.descripcion || "",
          sku: data.sku,
          precioCompra: data.precioCompra.toString(),
          precioVenta: data.precioVenta.toString(),
          temporada: data.temporada || "",
          categoria: data.categoria.nombre,
        })
        setVariantes(data.variantes)
        setLoadingData(false)
      })
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleVarianteChange = (index: number, field: string, value: string) => {
    const updated = [...variantes]
    updated[index] = { ...updated[index], [field]: value }
    setVariantes(updated)
  }

    const handleGuardar = async () => {
    setLoading(true)
    try {
      await fetch(`/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      await Promise.all(
        variantes.map((v) =>
          fetch(`/api/variantes/${v.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(v),
          })
        )
      )

      router.push("/inventario")
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarVariante = async (id: string) => {
    await fetch(`/api/variantes/${id}`, { method: "DELETE" })
    setVariantes(variantes.filter((v) => v.id !== id))
  }

  const handleAgregarVariante = () => {
    setVariantes([
      ...variantes,
      { id: `nueva-${Date.now()}`, talla: "", color: "", stockActual: 0, stockMinimo: 5, nueva: true },
    ])
  }

  const handleEliminarProducto = async () => {
    if (!confirm("¿Eliminar este producto y todas sus variantes?")) return
    await fetch(`/api/productos/${id}`, { method: "DELETE" })
    router.push("/inventario")
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

  if (loadingData) {
    return (
      <div style={{ color: "var(--muted-foreground)", padding: "40px" }}>
        Cargando producto...
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Editar producto
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {form.nombre}
          </p>
        </div>
        <button
          onClick={handleEliminarProducto}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--destructive)",
            background: "transparent",
            color: "var(--destructive)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Eliminar producto
        </button>
      </div>

      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 className="font-medium" style={{ color: "var(--foreground)" }}>Información</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>SKU</label>
            <input name="sku" value={form.sku} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} style={{ ...inputStyle, minHeight: "80px" }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Categoría</label>
            <input name="categoria" value={form.categoria} onChange={handleChange} style={inputStyle} />
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
            <input name="precioCompra" type="number" value={form.precioCompra} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Precio venta (Bs.)</label>
            <input name="precioVenta" type="number" value={form.precioVenta} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-medium" style={{ color: "var(--foreground)" }}>Variantes</h2>
          <button
            onClick={handleAgregarVariante}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            + Agregar variante
          </button>
        </div>

        {variantes.map((v, i) => (
          <div
            key={v.id}
            className="grid grid-cols-5 gap-3 items-end p-3 rounded-lg"
            style={{ background: "var(--muted)", borderRadius: "var(--radius-md)" }}
          >
            <div>
              <label style={labelStyle}>Talla</label>
              <select
                value={v.talla}
                onChange={(e) => handleVarianteChange(i, "talla", e.target.value)}
                style={inputStyle}
              >
                <option value="">-</option>
                <option>XS</option><option>S</option><option>M</option>
                <option>L</option><option>XL</option><option>XXL</option>
                <option>Única</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <input
                value={v.color}
                onChange={(e) => handleVarianteChange(i, "color", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Stock</label>
              <input
                type="number"
                value={v.stockActual}
                onChange={(e) => handleVarianteChange(i, "stockActual", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Mínimo</label>
              <input
                type="number"
                value={v.stockMinimo}
                onChange={(e) => handleVarianteChange(i, "stockMinimo", e.target.value)}
                style={inputStyle}
              />
            </div>
            <button
              onClick={() => handleEliminarVariante(v.id)}
              style={{
                padding: "8px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--destructive)",
                background: "transparent",
                color: "var(--destructive)",
                fontSize: "13px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Eliminar
            </button>
          </div>
        ))}
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
          onClick={handleGuardar}
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
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  )
}