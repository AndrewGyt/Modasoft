"use client"

import { useState, useRef } from "react"
import { FileText, Upload, Download, Trash2, AlertCircle } from "lucide-react"

interface Producto {
  descripcion: string
  codigo: string
  precioUnitario: number
  cantidad: number
}

const inputStyle = {
  background: "var(--input)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--foreground)",
  padding: "8px 12px",
  fontSize: "14px",
}

const labelStyle = {
  fontSize: "12px",
  fontWeight: 500 as const,
  color: "var(--muted-foreground)",
  display: "block",
  marginBottom: "4px",
}

export default function LectorFactura() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [productos, setProductos] = useState<Producto[]>([])
  const [moneda, setMoneda] = useState("BRL")
  const [tipoCambio, setTipoCambio] = useState("2.38")
  const [margen, setMargen] = useState("50")
  const [nombreCompra, setNombreCompra] = useState("")
  const [error, setError] = useState("")
  const [extraido, setExtraido] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setArchivo(file)
    setError("")
    setExtraido(false)
    setProductos([])
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const extraerDatos = async () => {
    if (!archivo) return
    setCargando(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", archivo)
      const res = await fetch("/api/ia/factura", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al procesar")
      setProductos(data.productos || [])
      if (data.moneda) setMoneda(data.moneda)
      setExtraido(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar la factura")
    } finally {
      setCargando(false)
    }
  }

  const actualizarProducto = (idx: number, campo: keyof Producto, valor: string) => {
    setProductos((prev) => {
      const nuevo = [...prev]
      if (campo === "precioUnitario" || campo === "cantidad") {
        nuevo[idx] = { ...nuevo[idx], [campo]: parseFloat(valor) || 0 }
      } else {
        nuevo[idx] = { ...nuevo[idx], [campo]: valor }
      }
      return nuevo
    })
  }

  const eliminarProducto = (idx: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== idx))
  }

  const generarExcel = async () => {
    if (!productos.length) return
    setGenerando(true)
    try {
      const res = await fetch("/api/ia/factura/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productos,
          tipoCambio: parseFloat(tipoCambio),
          margen: parseFloat(margen),
          nombreCompra: nombreCompra || "IAN-" + new Date().toISOString().slice(0, 10),
        }),
      })
      if (!res.ok) throw new Error("Error al generar Excel")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `factura-${nombreCompra || Date.now()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al generar Excel")
    } finally {
      setGenerando(false)
    }
  }

  const totalBRL = productos.reduce((s, p) => s + p.precioUnitario * p.cantidad, 0)
  const totalBs = totalBRL * parseFloat(tipoCambio || "0")

  return (
    <div
      className="rounded-xl border p-6 space-y-5"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <FileText size={20} style={{ color: "var(--primary)" }} />
        <div>
          <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
            Lector de Facturas
          </h2>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Sube una foto o PDF de factura brasileña → IA extrae los productos → descarga Excel
          </p>
        </div>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm"
          style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5" }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Upload area */}
      {!extraido && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
          style={{
            borderColor: archivo ? "var(--primary)" : "var(--border)",
            background: archivo ? "var(--primary)08" : "var(--muted)",
            padding: "32px 16px",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {preview ? (
            <img src={preview} alt="preview" style={{ maxHeight: 200, borderRadius: 8, objectFit: "contain" }} />
          ) : (
            <Upload size={32} style={{ color: "var(--muted-foreground)", opacity: 0.5 }} />
          )}
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
              {archivo ? archivo.name : "Arrastra o haz click para subir"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              JPG, PNG, WEBP o PDF
            </p>
          </div>
        </div>
      )}

      {archivo && !extraido && (
        <button
          onClick={extraerDatos}
          disabled={cargando}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: cargando ? "var(--muted)" : "var(--primary)",
            color: cargando ? "var(--muted-foreground)" : "var(--primary-foreground)",
            fontWeight: 600,
            fontSize: "14px",
            cursor: cargando ? "not-allowed" : "pointer",
          }}
        >
          {cargando ? "⏳ Analizando factura con IA..." : "🔍 Extraer productos"}
        </button>
      )}

      {/* Tabla de productos extraídos */}
      {extraido && productos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              ✅ {productos.length} productos extraídos — puedes editar antes de exportar
            </p>
            <button
              onClick={() => {
                setExtraido(false)
                setProductos([])
                setArchivo(null)
                setPreview(null)
              }}
              className="text-xs flex items-center gap-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              ← Nueva factura
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  {["Descripción", "Código", `Precio (${moneda})`, "Cant.", "Subtotal", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 10px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--muted-foreground)",
                        borderBottom: "1px solid var(--border)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productos.map((p, idx) => (
                  <tr
                    key={idx}
                    style={{
                      background: idx % 2 === 0 ? "transparent" : "var(--muted)40",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <td style={{ padding: "6px 10px" }}>
                      <input
                        value={p.descripcion}
                        onChange={(e) => actualizarProducto(idx, "descripcion", e.target.value)}
                        style={{ ...inputStyle, width: "100%", minWidth: 180 }}
                      />
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      <input
                        value={p.codigo}
                        onChange={(e) => actualizarProducto(idx, "codigo", e.target.value)}
                        style={{ ...inputStyle, width: 90 }}
                        placeholder="—"
                      />
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      <input
                        type="number"
                        value={p.precioUnitario}
                        onChange={(e) => actualizarProducto(idx, "precioUnitario", e.target.value)}
                        style={{ ...inputStyle, width: 90, textAlign: "right" }}
                      />
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      <input
                        type="number"
                        min="1"
                        value={p.cantidad}
                        onChange={(e) => actualizarProducto(idx, "cantidad", e.target.value)}
                        style={{ ...inputStyle, width: 60, textAlign: "center" }}
                      />
                    </td>
                    <td style={{ padding: "6px 10px", fontWeight: 600, textAlign: "right", whiteSpace: "nowrap" }}>
                      {(p.precioUnitario * p.cantidad).toFixed(2)} {moneda}
                    </td>
                    <td style={{ padding: "6px 10px" }}>
                      <button onClick={() => eliminarProducto(idx)} title="Eliminar">
                        <Trash2 size={14} style={{ color: "#EF4444" }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "var(--muted)", fontWeight: 700 }}>
                  <td colSpan={4} style={{ padding: "8px 10px", textAlign: "right" }}>
                    Total {moneda}:
                  </td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>
                    {totalBRL.toFixed(2)} {moneda}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Parámetros de conversión */}
          <div
            className="rounded-xl border p-4 grid grid-cols-2 gap-4"
            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
          >
            <div>
              <label style={labelStyle}>Nombre de la compra (hoja Excel)</label>
              <input
                value={nombreCompra}
                onChange={(e) => setNombreCompra(e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
                placeholder={`IAN-${new Date().toISOString().slice(0, 10)}`}
              />
            </div>
            <div>
              <label style={labelStyle}>Moneda de origen</label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              >
                <option value="BRL">Real brasileño (R$)</option>
                <option value="USD">Dólar ($)</option>
                <option value="ARS">Peso argentino</option>
                <option value="CNY">Yuan (¥)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo de cambio ({moneda} → Bs.)</label>
              <input
                type="number"
                value={tipoCambio}
                onChange={(e) => setTipoCambio(e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
                placeholder="2.38"
                step="0.01"
              />
            </div>
            <div>
              <label style={labelStyle}>Margen de ganancia (%)</label>
              <input
                type="number"
                value={margen}
                onChange={(e) => setMargen(e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
                placeholder="50"
              />
            </div>
          </div>

          {/* Resumen de conversión */}
          {totalBs > 0 && (
            <div
              className="rounded-xl p-4 grid grid-cols-3 gap-4 text-center"
              style={{ background: "var(--primary)10", border: "1px solid var(--primary)30" }}
            >
              <div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total {moneda}</p>
                <p className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
                  {totalBRL.toFixed(2)} {moneda}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Costo en Bs.</p>
                <p className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
                  Bs. {totalBs.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Precio venta estimado (+{margen}%)
                </p>
                <p className="font-bold text-lg" style={{ color: "#10B981" }}>
                  Bs. {(totalBs * (1 + parseFloat(margen || "0") / 100)).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={generarExcel}
            disabled={generando || productos.length === 0}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: generando ? "var(--muted)" : "#16A34A",
              color: generando ? "var(--muted-foreground)" : "#fff",
              fontWeight: 700,
              fontSize: "15px",
              cursor: generando ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Download size={18} />
            {generando ? "Generando Excel..." : "Descargar Excel"}
          </button>
        </div>
      )}

      {extraido && productos.length === 0 && (
        <div className="text-center py-6" style={{ color: "var(--muted-foreground)" }}>
          <p>No se detectaron productos en la factura.</p>
          <button
            onClick={() => { setExtraido(false); setArchivo(null); setPreview(null) }}
            className="text-sm mt-2"
            style={{ color: "var(--primary)" }}
          >
            Intentar con otro archivo
          </button>
        </div>
      )}
    </div>
  )
}