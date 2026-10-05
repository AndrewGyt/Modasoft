"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Mensaje {
  role: "user" | "assistant"
  content: string
}

const SUGERENCIAS = [
  "¿Cuánto vendí en total?",
  "¿Qué categoría vende más?",
  "¿Qué productos tienen stock bajo?",
  "¿Cuánto me deben en créditos?",
  "¿Cuál fue mi mejor mes?",
  "¿Qué producto debería liquidar?",
]

export default function ChatIA() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes])

  const enviar = async (texto?: string) => {
    const mensaje = texto || input
    if (!mensaje.trim() || loading) return

    const nuevosMensajes: Mensaje[] = [...mensajes, { role: "user", content: mensaje }]
    setMensajes(nuevosMensajes)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/ia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje,
          historial: mensajes.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      if (data.respuesta) {
        setMensajes([...nuevosMensajes, { role: "assistant", content: data.respuesta }])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-xl border flex flex-col"
      style={{ background: "var(--card)", borderColor: "var(--border)", height: "500px" }}
    >
      <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
        <Bot size={18} style={{ color: "var(--primary)" }} />
        <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>
          Chat con tus datos
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full ml-auto"
          style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
        >
          Powered by Claude
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensajes.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-center" style={{ color: "var(--muted-foreground)" }}>
              Pregúntame cualquier cosa sobre Tendance
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "var(--muted)",
                    color: "var(--muted-foreground)",
                    fontSize: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          mensajes.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: m.role === "user" ? "var(--primary)" : "var(--muted)",
                }}
              >
                {m.role === "user"
                  ? <User size={14} style={{ color: "var(--primary-foreground)" }} />
                  : <Bot size={14} style={{ color: "var(--muted-foreground)" }} />
                }
              </div>
              <div
                className="rounded-xl px-4 py-2 max-w-xs"
                style={{
                  background: m.role === "user" ? "var(--primary)" : "var(--muted)",
                  color: m.role === "user" ? "var(--primary-foreground)" : "var(--foreground)",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  maxWidth: "75%",
                }}
              >
                <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ margin: "4px 0" }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                  ul: ({ children }) => <ul style={{ paddingLeft: "16px", margin: "4px 0" }}>{children}</ul>,
                  li: ({ children }) => <li style={{ margin: "2px 0" }}>{children}</li>,
                  h2: ({ children }) => <p style={{ fontWeight: 700, margin: "6px 0 2px" }}>{children}</p>,
                  h3: ({ children }) => <p style={{ fontWeight: 600, margin: "4px 0 2px" }}>{children}</p>,
                  hr: () => <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.2)", margin: "6px 0" }} />,
                }}
              >
                {m.content}
              </ReactMarkdown>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "var(--muted)" }}
            >
              <Bot size={14} style={{ color: "var(--muted-foreground)" }} />
            </div>
            <div
              className="rounded-xl px-4 py-2"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontSize: "13px" }}
            >
              Analizando datos...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder="Pregunta algo sobre tu negocio..."
          style={{
            flex: 1,
            background: "var(--input)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--foreground)",
            padding: "8px 12px",
            fontSize: "13px",
          }}
        />
        <button
          onClick={() => enviar()}
          disabled={loading || !input.trim()}
          style={{
            padding: "8px 14px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}