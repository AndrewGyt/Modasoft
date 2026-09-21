"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NuevoProveedorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: "",
    contacto: "",
    pais: "",
    leadTimeDias: "7",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) router.push("/proveedores")
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
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Nuevo proveedor
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Agrega un proveedor a ModaSoft
        </p>
      </div>

      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div>
          <label style={labelStyle}>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} style={inputStyle} placeholder="Ej: Proveedor China" />
        </div>
        <div>
          <label style={labelStyle}>Contacto (teléfono o email)</label>
          <input name="contacto" value={form.contacto} onChange={handleChange} style={inputStyle} placeholder="Ej: +591 70000000" />
        </div>
        <div>
          <label style={labelStyle}>País</label>
          <input name="pais" value={form.pais} onChange={handleChange} style={inputStyle} placeholder="Ej: China" />
        </div>
        <div>
          <label style={labelStyle}>Lead time (días de entrega)</label>
          <input name="leadTimeDias" type="number" value={form.leadTimeDias} onChange={handleChange} style={inputStyle} placeholder="7" />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/proveedores")}
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
          {loading ? "Guardando..." : "Guardar proveedor"}
        </button>
      </div>
    </div>
  )
}