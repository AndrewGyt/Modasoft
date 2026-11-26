"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

interface Variante {
  talla: string
  color: string
  stockActual: string
  stockMinimo: string
}

const TALLAS = ["XS", "S", "M", "L", "XL", "XXL", "T/U"]

const varianteVacia = (): Variante => ({
  talla: "T/U",
  color: "",
  stockActual: "",
  stockMinimo: "1",
})

export default function NuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errores, setErrores] = useState<string[]>([])
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    sku: "",
    marca: "",
    precioVenta: "",
    precioCompra: "0",
    temporada: "",
    categoria: "",
  })
  const [variantes, setVariantes] = useState<Variante[]>([varianteVacia()])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleVarianteChange = (idx: number, field: keyof Variante, value: string) => {
    setVariantes((vs) => vs.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }

  const agregarVariante = () => setVariantes((vs) => [...vs, varianteVacia()])

  const eliminarVariante = (idx: number) => {
    if (variantes.length === 1) return
    setVariantes((vs) => vs.filter((_, i) => i !== idx))
  }

  const validar = () => {
    const faltantes: string[] = []
    if (!form.nombre.trim()) faltantes.push("Nombre del producto")
    if (!form.sku.trim()) faltantes.push("Código (SKU)")
    if (!form.categoria.trim()) faltantes.push("Categoría")
    if (!form.precioVenta || parseFloat(form.precioVenta) <= 0) faltantes.push("Precio de venta")
    variantes.forEach((v, i) => {
      if (!v.talla) faltantes.push(`Variante ${i + 1}: talla requerida`)
      if (v.stockActual === "") faltantes.push(`Variante ${i + 1}: stock requerido`)
    })
    return faltantes
  }

  const handleSubmit = async () => {
    const faltantes = validar()
    if (faltantes.length > 0) {
      setErrores(faltantes)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    setErrores([])
    setLoading(true)
    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          precioVenta: parseFloat(form.precioVenta),
          precioCompra: parseFloat(form.precioCompra) || 0,
          variantes: variantes.map((v) => ({
            talla: v.talla,
            color: v.color,
            stockActual: parseInt(v.stockActual) || 0,
            stockMinimo: parseInt(v.stockMinimo) || 1,
          })),
        }),
      })
      if (res.ok) router.push("/inventario")
      else {
        const data = await res.json()
        setErrores([data?.error || "Error al guardar"])
      }
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
  } as React.CSSProperties

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

      {errores.length > 0 && (
        <div className="rounded-xl border p-4 space-y-1" style={{ background: "#FEF2F2", borderColor: "#FCA5A5" }}>
          <p className="text-sm font-semibold" style={{ color: "#B91C1C" }}>
            Faltan los siguientes campos obligatorios:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {errores.map((e) => (
              <li key={e} className="text-sm" style={{ color: "#B91C1C" }}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Información del producto */}
      <div className="rounded-xl border p-6 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="font-medium" style={{ color: "var(--foreground)" }}>Información del producto</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Nombre <span style={{ color: "var(--destructive)" }}>*</span></label>
            <input name="nombre" value={form.nombre} onChange={handleChange} style={inputStyle} placeholder="Ej: Blusa floral" />
          </div>
          <div>
            <label style={labelStyle}>Marca</label>
            <input name="marca" value={form.marca} onChange={handleChange} style={inputStyle} placeholder="Ej: Cheers" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} style={{ ...inputStyle, minHeight: "70px" }} placeholder="Descripción opcional" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Categoría <span style={{ color: "var(--destructive)" }}>*</span></label>
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

        <div>
          <label style={labelStyle}>Código (SKU) <span style={{ color: "var(--destructive)" }}>*</span></label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Ej: IAN-88196"
            />
            <button
              type="button"
              onClick={() => {
                const cat = form.categoria.slice(0, 2).toUpperCase() || "PR"
                const rand = Math.floor(Math.random() * 90000) + 10000
                setForm((f) => ({ ...f, sku: `${cat}-${rand}` }))
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--secondary)",
                color: "var(--secondary-foreground)",
                fontSize: "13px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Generar
            </button>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            Usá el prefijo del lote: IAN = inventario noviembre, IAS = inventario septiembre, etc.
          </p>
        </div>
      </div>

      {/* Precios */}
      <div className="rounded-xl border p-6 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="font-medium" style={{ color: "var(--foreground)" }}>Precios</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Precio venta (Bs.) <span style={{ color: "var(--destructive)" }}>*</span></label>
            <input
              name="precioVenta"
              type="number"
              min="0"
              step="0.01"
              value={form.precioVenta}
              onChange={handleChange}
              style={inputStyle}
              placeholder="0.00"
            />
          </div>
          <div>
            <label style={labelStyle}>Costo prenda (Bs.)</label>
            <input
              name="precioCompra"
              type="number"
              min="0"
              step="0.01"
              value={form.precioCompra}
              onChange={handleChange}
              style={inputStyle}
              placeholder="0.00"
            />
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Usado para calcular margen en reportes
            </p>
          </div>
        </div>
        {parseFloat(form.precioVenta) > 0 && parseFloat(form.precioCompra) > 0 && (
          <div className="rounded-lg px-4 py-3 flex items-center gap-6"
            style={{ background: "var(--muted)" }}>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Margen por unidad</p>
              <p className="font-bold text-sm" style={{ color: "#10B981" }}>
                Bs. {(parseFloat(form.precioVenta) - parseFloat(form.precioCompra)).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Margen %</p>
              <p className="font-bold text-sm" style={{ color: "#10B981" }}>
                {(((parseFloat(form.precioVenta) - parseFloat(form.precioCompra)) / parseFloat(form.precioCompra)) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Variantes */}
      <div className="rounded-xl border p-6 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium" style={{ color: "var(--foreground)" }}>Variantes</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Cada variante es una combinación de talla y color con su propio stock
            </p>
          </div>
          <button
            type="button"
            onClick={agregarVariante}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--secondary)",
              color: "var(--secondary-foreground)",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            <Plus size={14} />
            Agregar variante
          </button>
        </div>

        <div className="space-y-3">
          {variantes.map((v, idx) => (
            <div
              key={idx}
              className="rounded-lg border p-4 space-y-3"
              style={{ borderColor: "var(--border)", background: "var(--background)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  VARIANTE {idx + 1}
                </span>
                {variantes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarVariante(idx)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}
                  >
                    <Trash2 size={14} style={{ color: "var(--destructive)" }} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label style={labelStyle}>Talla</label>
                  <select
                    value={v.talla}
                    onChange={(e) => handleVarianteChange(idx, "talla", e.target.value)}
                    style={inputStyle}
                  >
                    {TALLAS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Color</label>
                  <input
                    value={v.color}
                    onChange={(e) => handleVarianteChange(idx, "color", e.target.value)}
                    style={inputStyle}
                    placeholder="Ej: Negro"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Stock <span style={{ color: "var(--destructive)" }}>*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={v.stockActual}
                    onChange={(e) => handleVarianteChange(idx, "stockActual", e.target.value)}
                    style={inputStyle}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-1">
          <div className="h-px flex-1" style={{ background: "var(--border)" }} />
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {variantes.length} variante{variantes.length !== 1 ? "s" : ""} · {variantes.reduce((acc, v) => acc + (parseInt(v.stockActual) || 0), 0)} unidades en total
          </span>
          <div className="h-px flex-1" style={{ background: "var(--border)" }} />
        </div>
      </div>

      <div className="flex gap-3 pb-8">
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
            padding: "10px 24px",
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
