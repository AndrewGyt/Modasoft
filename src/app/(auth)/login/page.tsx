"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError("Email o contraseña incorrectos")
    } else {
      router.push("/dashboard")
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
            Inicia sesión en tu cuenta
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
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              placeholder="tu@email.com"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
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
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          ¿No tienes cuenta?{" "}
          <a href="/register" style={{ color: "var(--primary)", fontWeight: 500 }}>
            Regístrate
          </a>
        </p>
      </div>
    </div>
  )
}