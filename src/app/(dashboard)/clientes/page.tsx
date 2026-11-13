"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, Phone, Mail, ShoppingBag, CreditCard, Edit2, Trash2, X, Plus } from "lucide-react"

interface Venta {
  id: string
  total: number
  metodoPago: string
  createdAt: string
  detalles: {
    cantidad: number
    precioUnitario: number
    variante: { talla: string; color: string; producto: { nombre: string } }
  }[]
}

interface Credito {
  id: string
  montoTotal: number
  montoPagado: number
  estado: string
  fechaVencimiento: string
  createdAt: string
}

interface Cliente {
  id: string
  nombre: string
  telefono: string | null
  email: string | null
  createdAt: string
  ventas: Venta[]
  creditos: Credito[]
}

const estadoCreditoColor: Record<string, string> = {
  PENDIENTE: "#F59E0B",
  PARCIAL: "#3B82F6",
  PAGADO: "#10B981",
  VENCIDO: "#EF4444",
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

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 500,
  color: "var(--muted-foreground)",
  display: "block",
  marginBottom: "6px",
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [clienteDetalle, setClienteDetalle] = useState<Cliente | null>(null)
  const [tabDetalle, setTabDetalle] = useState<"compras" | "creditos">("compras")
  const [modalForm, setModalForm] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "" })
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback((q = "") => {
    setLoading(true)
    fetch(`/api/clientes?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => { setClientes(data); setLoading(false) })
  }, [])

  useEffect(() => { cargar() }, [cargar])

  useEffect(() => {
    const t = setTimeout(() => cargar(busqueda), 300)
    return () => clearTimeout(t)
  }, [busqueda, cargar])

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ nombre: "", telefono: "", email: "" })
    setModalForm(true)
  }

  const abrirEditar = (c: Cliente) => {
    setEditando(c)
    setForm({ nombre: c.nombre, telefono: c.telefono ?? "", email: c.email ?? "" })
    setModalForm(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim()) return
    setGuardando(true)
    const url = editando ? `/api/clientes/${editando.id}` : "/api/clientes"
    const method = editando ? "PUT" : "POST"
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setGuardando(false)
    setModalForm(false)
    cargar(busqueda)
  }

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar este cliente?")) return
    await fetch(`/api/clientes/${id}`, { method: "DELETE" })
    cargar(busqueda)
    if (clienteDetalle?.id === id) setClienteDetalle(null)
  }

  const totalCompras = (c: Cliente) => c.ventas.reduce((acc, v) => acc + v.total, 0)
  const creditoActivo = (c: Cliente) => c.creditos.find((cr) => cr.estado !== "PAGADO")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Clientes</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrados
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            fontSize: "14px", fontWeight: 500, cursor: "pointer",
          }}
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <input
        placeholder="Buscar por nombre, teléfono o email..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ ...inputStyle, maxWidth: 360 }}
      />

      {loading ? (
        <p style={{ color: "var(--muted-foreground)" }}>Cargando...</p>
      ) : clientes.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <Users size={32} className="mx-auto mb-2 opacity-40" style={{ color: "var(--muted-foreground)" }} />
          <p style={{ color: "var(--muted-foreground)" }}>
            {busqueda ? "Sin resultados para la búsqueda" : "No hay clientes registrados"}
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Nombre</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Contacto</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Compras</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Crédito activo</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: "var(--muted-foreground)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => {
                const ca = creditoActivo(c)
                return (
                  <tr key={c.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>
                      {c.nombre}
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      {c.telefono && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                          <Phone size={11} /> {c.telefono}
                        </div>
                      )}
                      {c.email && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                          <Mail size={11} /> {c.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                        Bs. {totalCompras(c).toFixed(2)}
                      </span>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {c.ventas.length} venta{c.ventas.length !== 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {ca ? (
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-full"
                          style={{ background: estadoCreditoColor[ca.estado] + "20", color: estadoCreditoColor[ca.estado] }}
                        >
                          Bs. {(ca.montoTotal - ca.montoPagado).toFixed(2)} pendiente
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => { setClienteDetalle(c); setTabDetalle("compras") }}
                          style={{ fontSize: "13px", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                        >
                          <ShoppingBag size={15} />
                        </button>
                        <button
                          onClick={() => abrirEditar(c)}
                          style={{ fontSize: "13px", color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => eliminar(c.id)}
                          style={{ fontSize: "13px", color: "var(--destructive)", background: "none", border: "none", cursor: "pointer" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Panel de detalle */}
      {clienteDetalle && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && setClienteDetalle(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
                  {clienteDetalle.nombre}
                </h2>
                <div className="flex gap-3 mt-1">
                  {clienteDetalle.telefono && (
                    <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                      <Phone size={11} /> {clienteDetalle.telefono}
                    </span>
                  )}
                  {clienteDetalle.email && (
                    <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                      <Mail size={11} /> {clienteDetalle.email}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setClienteDetalle(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2">
              {(["compras", "creditos"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTabDetalle(tab)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: tabDetalle === tab ? "var(--primary)" : "transparent",
                    color: tabDetalle === tab ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    fontSize: "13px", cursor: "pointer", fontWeight: 500,
                  }}
                >
                  {tab === "compras" ? (
                    <span className="flex items-center gap-1"><ShoppingBag size={13} /> Compras ({clienteDetalle.ventas.length})</span>
                  ) : (
                    <span className="flex items-center gap-1"><CreditCard size={13} /> Créditos ({clienteDetalle.creditos.length})</span>
                  )}
                </button>
              ))}
            </div>

            {tabDetalle === "compras" && (
              <div className="space-y-3">
                {clienteDetalle.ventas.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin compras registradas</p>
                ) : (
                  clienteDetalle.ventas.map((v) => (
                    <div key={v.id} className="rounded-lg p-3 space-y-2" style={{ background: "var(--muted)" }}>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "var(--muted-foreground)" }}>
                          {new Date(v.createdAt).toLocaleDateString("es-BO")}
                        </span>
                        <span className="font-bold" style={{ color: "var(--foreground)" }}>
                          Bs. {v.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs space-y-1" style={{ color: "var(--muted-foreground)" }}>
                        {v.detalles.map((d, i) => (
                          <div key={i}>
                            {d.variante.producto.nombre} · {d.variante.talla} {d.variante.color} · x{d.cantidad} · Bs. {d.precioUnitario.toFixed(2)}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        Pago: {v.metodoPago}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tabDetalle === "creditos" && (
              <div className="space-y-3">
                {clienteDetalle.creditos.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sin créditos registrados</p>
                ) : (
                  clienteDetalle.creditos.map((cr) => (
                    <div key={cr.id} className="rounded-lg p-3 space-y-1" style={{ background: "var(--muted)" }}>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "var(--muted-foreground)" }}>
                          {new Date(cr.createdAt).toLocaleDateString("es-BO")}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: estadoCreditoColor[cr.estado] + "20", color: estadoCreditoColor[cr.estado] }}
                        >
                          {cr.estado}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "var(--muted-foreground)" }}>Total crédito</span>
                        <span className="font-medium" style={{ color: "var(--foreground)" }}>Bs. {cr.montoTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "var(--muted-foreground)" }}>Pagado</span>
                        <span style={{ color: "#10B981" }}>Bs. {cr.montoPagado.toFixed(2)}</span>
                      </div>
                      {cr.estado !== "PAGADO" && (
                        <div className="flex justify-between text-sm">
                          <span style={{ color: "var(--muted-foreground)" }}>Pendiente</span>
                          <span className="font-bold" style={{ color: "var(--destructive)" }}>
                            Bs. {(cr.montoTotal - cr.montoPagado).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        Vence: {new Date(cr.fechaVencimiento).toLocaleDateString("es-BO")}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal nuevo/editar */}
      {modalForm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && setModalForm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6 space-y-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
              {editando ? "Editar cliente" : "Nuevo cliente"}
            </h2>

            <div className="space-y-3">
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  style={inputStyle}
                  placeholder="Ej: María González"
                />
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  style={inputStyle}
                  placeholder="Ej: 70123456"
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                  placeholder="Ej: maria@ejemplo.com"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalForm(false)}
                style={{
                  flex: 1, padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: "var(--secondary)",
                  color: "var(--secondary-foreground)",
                  fontSize: "14px", cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando || !form.nombre.trim()}
                style={{
                  flex: 1, padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontSize: "14px", fontWeight: 600,
                  cursor: guardando ? "not-allowed" : "pointer",
                  opacity: guardando || !form.nombre.trim() ? 0.7 : 1,
                }}
              >
                {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
