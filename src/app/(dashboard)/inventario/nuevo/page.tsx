"use client"


import { useState } from "react"
import { useRouter } from "next/navigation"

function generarSKU(categoria: string, marca: string) {
  const cat = categoria.slice(0, 3).toUpperCase() || "PRD"
  const mar = marca.slice(0, 2).toUpperCase() || "XX"
  const num = Math.floor(10000 + Math.random() * 90000)
  return `${cat}-${mar}-${num}`
}

const MONEDAS = [
  { codigo: "BOB", nombre: "Boliviano (Bs.)", simbolo: "Bs." },
  { codigo: "BRL", nombre: "Real brasileño (R$)", simbolo: "R$" },
  { codigo: "USD", nombre: "Dólar americano ($)", simbolo: "$" },
  { codigo: "ARS", nombre: "Peso argentino", simbolo: "AR$" },
  { codigo: "CNY", nombre: "Yuan chino (¥)", simbolo: "¥" },
]

export default function NuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [usarImportacion, setUsarImportacion] = useState(false)
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    sku: "",
    marca: "",
    precioCompra: "",
    precioVenta: "",
    temporada: "",
    categoria: "",
    talla: "",
    color: "",
    stockActual: "",
    stockMinimo: "5",
    monedaOrigen: "BRL",
    precioOrigen: "",
    tipoCambio: "",
    margenGanancia: "40",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }

    if (name === "categoria" || name === "marca") {
      updated.sku = generarSKU(
        name === "categoria" ? value : form.categoria,
        name === "marca" ? value : form.marca
      )
    }

    if (usarImportacion && ["precioOrigen", "tipoCambio", "margenGanancia"].includes(name)) {
      const origen = parseFloat(name === "precioOrigen" ? value : updated.precioOrigen) || 0
      const cambio = parseFloat(name === "tipoCambio" ? value : updated.tipoCambio) || 0
      const margen = parseFloat(name === "margenGanancia" ? value : updated.margenGanancia) || 0

      if (origen > 0 && cambio > 0) {
        const costoBs = origen * cambio
        const ventaBs = costoBs * (1 + margen / 100)
        updated.precioCompra = costoBs.toFixed(2)
        updated.precioVenta = ventaBs.toFixed(2)
      }
    }

    setForm(updated)
  }

  const costoCalculado = parseFloat(form.precioOrigen) * parseFloat(form.tipoCambio) || 0
  const precioVentaCalculado = costoCalculado * (1 + parseFloat(form.margenGanancia) / 100) || 0
  const gananciaPorUnidad = precioVentaCalculado - costoCalculado || 0

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          monedaOrigen: usarImportacion ? form.monedaOrigen : null,
          precioOrigen: usarImportacion ? parseFloat(form.precioOrigen) : null,
          tipoCambio: usarImportacion ? parseFloat(form.tipoCambio) : null,
          margenGanancia: usarImportacion ? parseFloat(form.margenGanancia) : null,
        }),
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

  const monedaSeleccionada = MONEDAS.find((m) => m.codigo === form.monedaOrigen)

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
            <label style={labelStyle}>Marca</label>
            <input name="marca" value={form.marca} onChange={handleChange} style={inputStyle} placeholder="Ej: Zara" />
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

        <div>
          <label style={labelStyle}>SKU (auto-generado)</label>
          <div className="flex gap-2">
            <input name="sku" value={form.sku} onChange={handleChange} style={inputStyle} placeholder="Se genera al escribir categoría y marca" />
            <button
              onClick={() => setForm({ ...form, sku: generarSKU(form.categoria, form.marca) })}
              type="button"
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
              Regenerar
            </button>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-medium" style={{ color: "var(--foreground)" }}>Precios</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={usarImportacion}
              onChange={(e) => setUsarImportacion(e.target.checked)}
            />
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Producto importado (calcular desde moneda origen)
            </span>
          </label>
        </div>

        {usarImportacion ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Moneda de origen</label>
                <select name="monedaOrigen" value={form.monedaOrigen} onChange={handleChange} style={inputStyle}>
                  {MONEDAS.filter((m) => m.codigo !== "BOB").map((m) => (
                    <option key={m.codigo} value={m.codigo}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>
                  Precio en {monedaSeleccionada?.simbolo || "moneda origen"}
                </label>
                <input
                  name="precioOrigen"
                  type="number"
                  value={form.precioOrigen}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>
                  Tipo de cambio ({form.monedaOrigen} → Bs.)
                </label>
                <input
                  name="tipoCambio"
                  type="number"
                  value={form.tipoCambio}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Ej: 1.30 para BRL"
                />
              </div>
              <div>
                <label style={labelStyle}>Margen de ganancia (%)</label>
                <input
                  name="margenGanancia"
                  type="number"
                  value={form.margenGanancia}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="40"
                />
              </div>
            </div>

            {costoCalculado > 0 && (
              <div
                className="rounded-lg p-4 space-y-2"
                style={{ background: "var(--muted)" }}
              >
                <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  RESUMEN DE PRECIOS
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <span style={{ color: "var(--muted-foreground)" }}>Costo en Bs.:</span>
                  <span className="font-medium" style={{ color: "var(--foreground)" }}>
                    Bs. {costoCalculado.toFixed(2)}
                  </span>
                  <span style={{ color: "var(--muted-foreground)" }}>Precio de venta:</span>
                  <span className="font-bold" style={{ color: "var(--foreground)" }}>
                    Bs. {precioVentaCalculado.toFixed(2)}
                  </span>
                  <span style={{ color: "var(--muted-foreground)" }}>Ganancia por unidad:</span>
                  <span className="font-bold" style={{ color: "#10B981" }}>
                    Bs. {gananciaPorUnidad.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

          </div>
        ) : (
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
        )}
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
              <option>XS</option><option>S</option><option>M</option>
              <option>L</option><option>XL</option><option>XXL</option>
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