"use client"

import { useState, useEffect } from "react"
import { CreditCard, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface Credito {
  id: string
  montoTotal: number
  montoPagado: number
  fechaVencimiento: string
  estado: "PENDIENTE" | "PARCIAL" | "PAGADO" | "VENCIDO"
  notas: string | null
  cliente: { nombre: string; telefono: string | null }
  venta: { id: string; createdAt: string }
  pagos: { id: string; monto: number; metodoPago: string; createdAt: string }[]
}

const estadoColor = {
  PENDIENTE: "#F59E0B",
  PARCIAL: "#3B82F6",
  PAGADO: "#10B981",
  VENCIDO: "#EF4444",
}

const estadoIcon = {
  PENDIENTE: Clock,
  PARCIAL: CreditCard,
  PAGADO: CheckCircle,
  VENCIDO: AlertTriangle,
}

export default function CreditosPage() {
  const [creditos, setCreditos] = useState<Credito[]>([])
  const [loading, setLoading] = useState(true)
  const [creditoSeleccionado, setCreditoSeleccionado] = useState<Credito | null>(null)
  const [pago, setPago] = useState({ monto: "", metodoPago: "efectivo", notas: "" })
  const [registrandoPago, setRegistrandoPago] = useState(false)
  const [errorPago, setErrorPago] = useState("")

  const cargarCreditos = () => {
    fetch("/api/creditos")
      .then((r) => r.json())
      .then((data) => { setCreditos(data); setLoading(false) })
  }

  useEffect(() => { cargarCreditos() }, [])

  const totalPendiente = creditos
    .filter((c) => c.estado !== "PAGADO")
    .reduce((acc, c) => acc + (c.montoTotal - c.montoPagado), 0)

  const handleRegistrarPago = async () => {
  if (!creditoSeleccionado || !pago.monto) return
  setErrorPago("")
  setRegistrandoPago(true)

  const res = await fetch(`/api/creditos/${creditoSeleccionado.id}/pagos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pago),
  })

  const data = await res.json()
  setRegistrandoPago(false)

  if (!res.ok) {
    setErrorPago(data.error)
    return
  }

  setCreditoSeleccionado(null)
  setPago({ monto: "", metodoPago: "efectivo", notas: "" })
  setErrorPago("")
  cargarCreditos()
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Créditos
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Cuentas por cobrar de Tendance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Total por cobrar</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--destructive)" }}>
            Bs. {totalPendiente.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Créditos activos</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--foreground)" }}>
            {creditos.filter((c) => c.estado !== "PAGADO").length}
          </p>
        </div>
        <div className="rounded-xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Vencidos</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "#EF4444" }}>
            {creditos.filter((c) => c.estado === "VENCIDO").length}
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted-foreground)" }}>Cargando...</p>
      ) : creditos.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <CreditCard size={32} className="mx-auto mb-2 opacity-40" style={{ color: "var(--muted-foreground)" }} />
          <p style={{ color: "var(--muted-foreground)" }}>No hay créditos registrados</p>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Al registrar una venta a crédito aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {creditos.map((c) => {
            const Icon = estadoIcon[c.estado]
            const montoRestante = c.montoTotal - c.montoPagado
            const porcentaje = (c.montoPagado / c.montoTotal) * 100

            return (
              <div
                key={c.id}
                className="rounded-xl border p-5 space-y-3"
                style={{ background: "var(--card)", borderColor: c.estado === "VENCIDO" ? "#EF4444" : "var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon size={18} style={{ color: estadoColor[c.estado] }} />
                    <div>
                      <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                        {c.cliente.nombre}
                      </p>
                      {c.cliente.telefono && (
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {c.cliente.telefono}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: estadoColor[c.estado] + "20", color: estadoColor[c.estado] }}
                    >
                      {c.estado}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted-foreground)" }}>Total crédito</span>
                    <span className="font-medium" style={{ color: "var(--foreground)" }}>Bs. {c.montoTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted-foreground)" }}>Pagado</span>
                    <span className="font-medium" style={{ color: "#10B981" }}>Bs. {c.montoPagado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--muted-foreground)" }}>Restante</span>
                    <span className="font-bold" style={{ color: "var(--destructive)" }}>Bs. {montoRestante.toFixed(2)}</span>
                  </div>

                  <div className="w-full rounded-full h-2 mt-2" style={{ background: "var(--muted)" }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, porcentaje)}%`, background: estadoColor[c.estado] }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <span>Vence: {new Date(c.fechaVencimiento).toLocaleDateString("es-BO")}</span>
                  <span>Creado: {new Date(c.venta.createdAt).toLocaleDateString("es-BO")}</span>
                </div>

                {c.notas && (
                  <p className="text-xs italic" style={{ color: "var(--muted-foreground)" }}>{c.notas}</p>
                )}

                {c.estado !== "PAGADO" && (
                  <button
                    onClick={() => setCreditoSeleccionado(c)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #10B981",
                      background: "transparent",
                      color: "#10B981",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Registrar pago
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {creditoSeleccionado && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && setCreditoSeleccionado(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6 space-y-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>
              Registrar pago — {creditoSeleccionado.cliente.nombre}
            </h2>

            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Restante: Bs. {(creditoSeleccionado.montoTotal - creditoSeleccionado.montoPagado).toFixed(2)}
            </p>

            {errorPago && (
              <p className="text-sm" style={{ color: "var(--destructive)" }}>
                {errorPago}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Monto a pagar (Bs.)
                </label>
                <input
                  type="number"
                  value={pago.monto}
                  onChange={(e) => setPago({ ...pago, monto: e.target.value })}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Método de pago
                </label>
                <select
                  value={pago.metodoPago}
                  onChange={(e) => setPago({ ...pago, metodoPago: e.target.value })}
                  style={inputStyle}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="qr">QR</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Notas
                </label>
                <input
                  value={pago.notas}
                  onChange={(e) => setPago({ ...pago, notas: e.target.value })}
                  style={inputStyle}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCreditoSeleccionado(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: "var(--secondary)",
                  color: "var(--secondary-foreground)",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarPago}
                disabled={registrandoPago || !pago.monto}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: registrandoPago ? "not-allowed" : "pointer",
                  opacity: registrandoPago ? 0.7 : 1,
                }}
              >
                {registrandoPago ? "Guardando..." : "Registrar pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}