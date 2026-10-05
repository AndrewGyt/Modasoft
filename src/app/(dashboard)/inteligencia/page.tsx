"use client"

import { useState } from "react"
import { Brain, TrendingUp, AlertTriangle, Package, Lightbulb, RefreshCw } from "lucide-react"
import ChatIA from "@/components/modules/ChatIA"

interface Analisis {
  resumen: string
  prediccionDemanda: {
    categoria: string
    tendencia: "CRECIENTE" | "ESTABLE" | "DECRECIENTE"
    confianza: "ALTA" | "MEDIA" | "BAJA"
    recomendacion: string
    cantidadSugerida: number
  }[]
  alertas: {
    tipo: "CRITICO" | "ADVERTENCIA" | "OPORTUNIDAD"
    titulo: string
    descripcion: string
    accion: string
  }[]
  recomendacionesStock: {
    producto: string
    accion: "REPONER" | "LIQUIDAR" | "MANTENER"
    cantidad: number
    razon: string
  }[]
  insightsMercado: {
    titulo: string
    descripcion: string
    impacto: "ALTO" | "MEDIO" | "BAJO"
  }[]
  prediccionProximoMes: {
    ventasEstimadas: number
    categoriaEstrella: string
    riesgoStockout: string
  }
}

const tendenciaColor = {
  CRECIENTE: "#10B981",
  ESTABLE: "#F59E0B",
  DECRECIENTE: "#EF4444",
}

const alertaColor = {
  CRITICO: "#EF4444",
  ADVERTENCIA: "#F59E0B",
  OPORTUNIDAD: "#10B981",
}

const accionColor = {
  REPONER: "#3B82F6",
  LIQUIDAR: "#EF4444",
  MANTENER: "#10B981",
}

const impactoColor = {
  ALTO: "#6366F1",
  MEDIO: "#F59E0B",
  BAJO: "#94A3B8",
}

export default function InteligenciaPage() {
  const [analisis, setAnalisis] = useState<Analisis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const ejecutarAnalisis = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/ia")
      const data = await res.json()
      if (data.analisis?.error) {
        setError("Error al procesar el análisis. Intenta de nuevo.")
      } else {
        setAnalisis(data.analisis)
      }
    } catch {
      setError("Error de conexión. Verifica tu internet.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Brain size={24} />
            Inteligencia de Negocio
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Análisis predictivo con IA basado en datos históricos de Tendance
          </p>
        </div>
        <button
          onClick={ejecutarAnalisis}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: loading ? "var(--muted)" : "var(--primary)",
            color: loading ? "var(--muted-foreground)" : "var(--primary-foreground)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Analizando..." : analisis ? "Re-analizar" : "Ejecutar análisis"}
        </button>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl border"
          style={{ background: "#FEF2F2", borderColor: "#EF4444", color: "#EF4444" }}
        >
          {error}
        </div>
      )}

      {!analisis && !loading && (
        <div
          className="rounded-xl border p-16 text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <Brain size={48} className="mx-auto mb-4 opacity-20" style={{ color: "var(--foreground)" }} />
          <p className="font-medium" style={{ color: "var(--foreground)" }}>
            Análisis predictivo con IA
          </p>
          <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
            Haz click en "Ejecutar análisis" para que la IA analice tus datos históricos
            y genere predicciones de demanda, alertas y recomendaciones.
          </p>
        </div>
      )}

      {loading && (
        <div
          className="rounded-xl border p-16 text-center"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <RefreshCw size={32} className="mx-auto mb-4 animate-spin" style={{ color: "var(--primary)" }} />
          <p className="font-medium" style={{ color: "var(--foreground)" }}>
            La IA está analizando tus datos...
          </p>
          <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
            Esto puede tomar unos segundos
          </p>
        </div>
      )}

      {analisis && !loading && (
        <div className="space-y-6">
          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <p className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>
              Resumen ejecutivo
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {analisis.resumen}
            </p>
          </div>

          {analisis.prediccionProximoMes && (
            <div className="grid grid-cols-3 gap-4">
              <div
                className="rounded-xl border p-5"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Ventas estimadas próximo mes
                </p>
                <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                  Bs. {analisis.prediccionProximoMes.ventasEstimadas?.toLocaleString()}
                </p>
              </div>
              <div
                className="rounded-xl border p-5"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Categoría estrella
                </p>
                <p className="text-xl font-bold" style={{ color: "#6366F1" }}>
                  {analisis.prediccionProximoMes.categoriaEstrella}
                </p>
              </div>
              <div
                className="rounded-xl border p-5"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Riesgo de stockout
                </p>
                <p className="text-sm" style={{ color: "#F59E0B" }}>
                  {analisis.prediccionProximoMes.riesgoStockout}
                </p>
              </div>
            </div>
          )}

          {analisis.alertas?.length > 0 && (
            <div
              className="rounded-xl border p-6"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <AlertTriangle size={18} />
                Alertas inteligentes
              </h2>
              <div className="space-y-3">
                {analisis.alertas.map((alerta, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border-l-4"
                    style={{
                      background: alertaColor[alerta.tipo] + "10",
                      borderLeftColor: alertaColor[alerta.tipo],
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: alertaColor[alerta.tipo] + "20",
                          color: alertaColor[alerta.tipo],
                        }}
                      >
                        {alerta.tipo}
                      </span>
                      <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                        {alerta.titulo}
                      </p>
                    </div>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                      {alerta.descripcion}
                    </p>
                    <p className="text-xs mt-2 font-medium" style={{ color: alertaColor[alerta.tipo] }}>
                      → {alerta.accion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analisis.prediccionDemanda?.length > 0 && (
            <div
              className="rounded-xl border p-6"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <TrendingUp size={18} />
                Predicción de demanda por categoría
              </h2>
              <div className="space-y-3">
                {analisis.prediccionDemanda.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-lg"
                    style={{ background: "var(--muted)" }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                          {p.categoria}
                        </p>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: tendenciaColor[p.tendencia] + "20",
                            color: tendenciaColor[p.tendencia],
                          }}
                        >
                          {p.tendencia}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "var(--border)", color: "var(--muted-foreground)" }}
                        >
                          Confianza: {p.confianza}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {p.recomendacion}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                        {p.cantidadSugerida}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>uds sugeridas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analisis.recomendacionesStock?.length > 0 && (
            <div
              className="rounded-xl border p-6"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <Package size={18} />
                Recomendaciones de stock
              </h2>
              <div className="space-y-2">
                {analisis.recomendacionesStock.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: "var(--muted)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-md"
                        style={{
                          background: accionColor[r.accion] + "20",
                          color: accionColor[r.accion],
                        }}
                      >
                        {r.accion}
                      </span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                          {r.producto}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {r.razon}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                      {r.cantidad} uds
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analisis.insightsMercado?.length > 0 && (
            <div
              className="rounded-xl border p-6"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                <Lightbulb size={18} />
                Insights del mercado
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {analisis.insightsMercado.map((insight, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border"
                    style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: impactoColor[insight.impacto] + "20",
                          color: impactoColor[insight.impacto],
                        }}
                      >
                        {insight.impacto}
                      </span>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {insight.titulo}
                      </p>
                    </div>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {insight.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <ChatIA />
    </div>
  )
}