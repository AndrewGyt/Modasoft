"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nombre: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error || "Error al registrar")
    } else {
      router.push("/login")
    }
  }

  const inputStyle = {
    background: "var(--input)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--foreground)",
    padding: "10px 14px",
    width: "100%",
    fontSize: "14px",
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--background)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8 space-y-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            ModaSoft
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Crea tu cuenta
          </p>
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: "var(--destructive)" }}>
            {error}
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
              Nombre
            </label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              style={inputStyle}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={inputStyle}
              placeholder="Mínimo 8 caracteres"
            />
          </div>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: "100%",
            padding: "11px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>

        <p className="text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          ¿Ya tienes cuenta?{" "}
          <a href="/login" style={{ color: "var(--primary)", fontWeight: 500 }}>
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  )
}