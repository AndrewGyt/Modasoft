"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Package, ShoppingCart, BarChart3, Brain,
  CreditCard, Truck, QrCode, TrendingUp,
  Globe, Check, ArrowRight, Menu, X
} from "lucide-react"

const content = {
  es: {
    nav: { features: "Funciones", pricing: "Precios", login: "Ingresar", cta: "Comenzar gratis" },
    hero: {
      badge: "Sistema de gestión para tiendas de ropa",
      title: "Gestiona tu tienda de moda con",
      titleHighlight: "inteligencia artificial",
      subtitle: "ModaSoft es el primer sistema de gestión para boutiques bolivianas con IA integrada. Controla inventario, ventas, créditos y predicción de tendencias en un solo lugar.",
      cta: "Comenzar ahora",
      ctaSub: "Sin tarjeta de crédito",
      demo: "Ver demo",
    },
    stats: [
      { value: "44+", label: "Productos gestionados" },
      { value: "Bs. 0", label: "Costo inicial" },
      { value: "6", label: "Módulos integrados" },
      { value: "IA", label: "Análisis predictivo" },
    ],
    features: {
      title: "Todo lo que necesitas para tu tienda",
      subtitle: "Diseñado específicamente para el mercado boliviano",
      items: [
        { icon: Package, title: "Inventario inteligente", desc: "Gestiona productos, tallas, colores y stock mínimo con alertas automáticas y códigos QR por prenda." },
        { icon: ShoppingCart, title: "Punto de venta", desc: "Registra ventas con carrito, descuento para clientes fieles del 7% y múltiples métodos de pago." },
        { icon: CreditCard, title: "Control de créditos", desc: "Gestiona ventas a crédito con seguimiento de pagos, abonos y alertas de vencimiento." },
        { icon: Truck, title: "Órdenes de compra", desc: "Gestiona proveedores y órdenes de compra con seguimiento de estados en tiempo real." },
        { icon: BarChart3, title: "Reportes por mes", desc: "Analiza ventas por categoría, productos más vendidos y márgenes reales por mes." },
        { icon: Brain, title: "Inteligencia artificial", desc: "Predicción de demanda, detector de productos muertos, análisis de rentabilidad y chat con tus datos." },
      ],
    },
    ai: {
      badge: "Exclusivo ModaSoft",
      title: "IA pensada para el mercado boliviano",
      subtitle: "El único sistema de gestión para boutiques con análisis predictivo integrado",
      items: [
        { title: "Predicción de temporada", desc: "Anticipa qué categorías van a subir en fiestas patrias, fin de año y temporadas de frío/calor en Bolivia." },
        { title: "Detector de productos muertos", desc: "Identifica prendas sin movimiento y sugiere precios de descuento para liberar capital." },
        { title: "Chat con tus datos", desc: "Pregunta cualquier cosa: ¿cuánto gané en agosto?, ¿qué debo liquidar?, y obtén respuestas inmediatas." },
        { title: "Orden de compra automática", desc: "La IA analiza tu stock y velocidad de ventas para sugerirte qué y cuánto pedir al proveedor." },
      ],
    },
    pricing: {
      title: "Precio simple y transparente",
      subtitle: "Sin sorpresas, sin comisiones ocultas",
      free: {
        title: "Gratuito",
        price: "Bs. 0",
        period: "/mes",
        desc: "Para empezar",
        features: ["1 tienda", "Inventario ilimitado", "Módulo de ventas", "Reportes básicos"],
        cta: "Comenzar gratis",
      },
      pro: {
        title: "Pro",
        price: "Bs. 150",
        period: "/mes",
        desc: "Para crecer",
        badge: "Recomendado",
        features: ["Multi-sucursal", "Inteligencia artificial", "Análisis predictivo", "Chat con tus datos", "Soporte prioritario"],
        cta: "Empezar prueba gratis",
      },
    },
    footer: {
      desc: "El sistema de gestión diseñado para boutiques bolivianas.",
      rights: "Todos los derechos reservados.",
    },
  },
  en: {
    nav: { features: "Features", pricing: "Pricing", login: "Log in", cta: "Get started" },
    hero: {
      badge: "Fashion store management system",
      title: "Manage your fashion store with",
      titleHighlight: "artificial intelligence",
      subtitle: "ModaSoft is the first management system for Bolivian boutiques with integrated AI. Control inventory, sales, credits and trend prediction in one place.",
      cta: "Get started now",
      ctaSub: "No credit card required",
      demo: "Watch demo",
    },
    stats: [
      { value: "44+", label: "Products managed" },
      { value: "Bs. 0", label: "Initial cost" },
      { value: "6", label: "Integrated modules" },
      { value: "AI", label: "Predictive analytics" },
    ],
    features: {
      title: "Everything you need for your store",
      subtitle: "Designed specifically for the Bolivian market",
      items: [
        { icon: Package, title: "Smart inventory", desc: "Manage products, sizes, colors and minimum stock with automatic alerts and QR codes per garment." },
        { icon: ShoppingCart, title: "Point of sale", desc: "Register sales with cart, 7% loyal customer discount and multiple payment methods." },
        { icon: CreditCard, title: "Credit control", desc: "Manage credit sales with payment tracking, installments and expiration alerts." },
        { icon: Truck, title: "Purchase orders", desc: "Manage suppliers and purchase orders with real-time status tracking." },
        { icon: BarChart3, title: "Monthly reports", desc: "Analyze sales by category, best-selling products and real margins by month." },
        { icon: Brain, title: "Artificial intelligence", desc: "Demand prediction, dead product detector, profitability analysis and chat with your data." },
      ],
    },
    ai: {
      badge: "ModaSoft exclusive",
      title: "AI built for the Bolivian market",
      subtitle: "The only boutique management system with integrated predictive analytics",
      items: [
        { title: "Season prediction", desc: "Anticipate which categories will rise during national holidays, year-end and cold/warm seasons in Bolivia." },
        { title: "Dead product detector", desc: "Identify garments with no movement and suggest discount prices to free up capital." },
        { title: "Chat with your data", desc: "Ask anything: how much did I earn in August?, what should I liquidate?, and get immediate answers." },
        { title: "Automatic purchase order", desc: "AI analyzes your stock and sales velocity to suggest what and how much to order from your supplier." },
      ],
    },
    pricing: {
      title: "Simple and transparent pricing",
      subtitle: "No surprises, no hidden fees",
      free: {
        title: "Free",
        price: "Bs. 0",
        period: "/month",
        desc: "To get started",
        features: ["1 store", "Unlimited inventory", "Sales module", "Basic reports"],
        cta: "Start for free",
      },
      pro: {
        title: "Pro",
        price: "Bs. 150",
        period: "/month",
        desc: "To grow",
        badge: "Recommended",
        features: ["Multi-branch", "Artificial intelligence", "Predictive analytics", "Chat with your data", "Priority support"],
        cta: "Start free trial",
      },
    },
    footer: {
      desc: "The management system designed for Bolivian boutiques.",
      rights: "All rights reserved.",
    },
  },
}

export default function LandingPage() {
  const [lang, setLang] = useState<"es" | "en">("es")
  const [menuOpen, setMenuOpen] = useState(false)
  const t = content[lang]

  return (
    <div style={{ fontFamily: "var(--font-geist-sans), sans-serif", background: "#fff", color: "#111" }}>
      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid #f0f0f0",
        padding: "0 24px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: "1200px", margin: "0 auto",
      }}>
        <span style={{ fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px" }}>ModaSoft</span>

        <div style={{ display: "flex", alignItems: "center", gap: "32px" }} className="hidden md:flex">
          <a href="#features" style={{ fontSize: "14px", color: "#555", textDecoration: "none" }}>{t.nav.features}</a>
          <a href="#pricing" style={{ fontSize: "14px", color: "#555", textDecoration: "none" }}>{t.nav.pricing}</a>
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              background: "none", border: "1px solid #e0e0e0",
              borderRadius: "6px", padding: "4px 10px",
              fontSize: "13px", cursor: "pointer", color: "#555",
            }}
          >
            <Globe size={14} />
            {lang === "es" ? "EN" : "ES"}
          </button>
          <Link href="/login" style={{ fontSize: "14px", color: "#555", textDecoration: "none" }}>
            {t.nav.login}
          </Link>
          <Link href="/register" style={{
            fontSize: "14px", fontWeight: 600,
            background: "#111", color: "#fff",
            padding: "8px 18px", borderRadius: "8px",
            textDecoration: "none",
          }}>
            {t.nav.cta}
          </Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer" }} className="md:hidden">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {menuOpen && (
        <div style={{
          background: "#fff", borderBottom: "1px solid #f0f0f0",
          padding: "16px 24px", display: "flex", flexDirection: "column", gap: "16px",
        }}>
          <a href="#features" style={{ fontSize: "15px", color: "#333", textDecoration: "none" }}>{t.nav.features}</a>
          <a href="#pricing" style={{ fontSize: "15px", color: "#333", textDecoration: "none" }}>{t.nav.pricing}</a>
          <Link href="/login" style={{ fontSize: "15px", color: "#333", textDecoration: "none" }}>{t.nav.login}</Link>
          <Link href="/register" style={{
            fontSize: "15px", fontWeight: 600, background: "#111", color: "#fff",
            padding: "10px 18px", borderRadius: "8px", textDecoration: "none", textAlign: "center",
          }}>{t.nav.cta}</Link>
        </div>
      )}

      {/* HERO */}
      <section style={{
        maxWidth: "1200px", margin: "0 auto",
        padding: "80px 24px 60px",
        textAlign: "center",
      }}>
        <span style={{
          display: "inline-block",
          background: "#f4f4f4", color: "#555",
          fontSize: "13px", fontWeight: 500,
          padding: "6px 14px", borderRadius: "100px",
          marginBottom: "24px",
        }}>
          {t.hero.badge}
        </span>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 800, lineHeight: 1.1,
          letterSpacing: "-2px", marginBottom: "24px",
        }}>
          {t.hero.title}<br />
          <span style={{
            background: "linear-gradient(135deg, #111 0%, #555 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {t.hero.titleHighlight}
          </span>
        </h1>

        <p style={{
          fontSize: "18px", color: "#666", lineHeight: 1.6,
          maxWidth: "600px", margin: "0 auto 40px",
        }}>
          {t.hero.subtitle}
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#111", color: "#fff",
            padding: "14px 28px", borderRadius: "10px",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
          }}>
            {t.hero.cta} <ArrowRight size={16} />
          </Link>
          <a href="#features" style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#f4f4f4", color: "#111",
            padding: "14px 28px", borderRadius: "10px",
            fontSize: "15px", fontWeight: 500, textDecoration: "none",
          }}>
            {t.hero.demo}
          </a>
        </div>

        <p style={{ fontSize: "13px", color: "#999", marginTop: "16px" }}>
          {t.hero.ctaSub}
        </p>
      </section>

      {/* STATS */}
      <section style={{
        borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0",
        padding: "40px 24px",
      }}>
        <div style={{
          maxWidth: "800px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px", textAlign: "center",
        }}>
          {t.stats.map((s, i) => (
            <div key={i}>
              <p style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-1px" }}>{s.value}</p>
              <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>
            {t.features.title}
          </h2>
          <p style={{ fontSize: "16px", color: "#666" }}>{t.features.subtitle}</p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}>
          {t.features.items.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} style={{
                padding: "28px", borderRadius: "12px",
                border: "1px solid #f0f0f0",
                transition: "border-color 0.2s",
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "16px",
                }}>
                  <Icon size={20} color="#111" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* AI SECTION */}
      <section style={{ background: "#111", padding: "80px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span style={{
              display: "inline-block",
              background: "#222", color: "#999",
              fontSize: "13px", fontWeight: 500,
              padding: "6px 14px", borderRadius: "100px",
              marginBottom: "20px",
            }}>
              {t.ai.badge}
            </span>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800,
              letterSpacing: "-1px", color: "#fff", marginBottom: "12px",
            }}>
              {t.ai.title}
            </h2>
            <p style={{ fontSize: "16px", color: "#888" }}>{t.ai.subtitle}</p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}>
            {t.ai.items.map((item, i) => (
              <div key={i} style={{
                padding: "24px", borderRadius: "12px",
                border: "1px solid #222", background: "#1a1a1a",
              }}>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#fff", marginBottom: "16px",
                }} />
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: "12px" }}>
            {t.pricing.title}
          </h2>
          <p style={{ fontSize: "16px", color: "#666" }}>{t.pricing.subtitle}</p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px", maxWidth: "700px", margin: "0 auto",
        }}>
          <div style={{
            padding: "32px", borderRadius: "16px",
            border: "1px solid #f0f0f0",
          }}>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "8px" }}>{t.pricing.free.title}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
              <span style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-2px" }}>{t.pricing.free.price}</span>
              <span style={{ color: "#888", fontSize: "14px" }}>{t.pricing.free.period}</span>
            </div>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>{t.pricing.free.desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
              {t.pricing.free.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Check size={14} color="#111" />
                  <span style={{ fontSize: "14px", color: "#444" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/register" style={{
              display: "block", textAlign: "center",
              border: "1px solid #e0e0e0", borderRadius: "8px",
              padding: "11px", fontSize: "14px", fontWeight: 600,
              color: "#111", textDecoration: "none",
            }}>
              {t.pricing.free.cta}
            </Link>
          </div>

          <div style={{
            padding: "32px", borderRadius: "16px",
            background: "#111", position: "relative",
          }}>
            <span style={{
              position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
              background: "#fff", color: "#111", fontSize: "12px", fontWeight: 700,
              padding: "4px 12px", borderRadius: "100px",
            }}>
              {t.pricing.pro.badge}
            </span>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "8px" }}>{t.pricing.pro.title}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
              <span style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-2px", color: "#fff" }}>{t.pricing.pro.price}</span>
              <span style={{ color: "#888", fontSize: "14px" }}>{t.pricing.pro.period}</span>
            </div>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>{t.pricing.pro.desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
              {t.pricing.pro.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Check size={14} color="#fff" />
                  <span style={{ fontSize: "14px", color: "#ccc" }}>{f}</span>
                </div>
              ))}
            </div>
            <Link href="/register" style={{
              display: "block", textAlign: "center",
              background: "#fff", borderRadius: "8px",
              padding: "11px", fontSize: "14px", fontWeight: 600,
              color: "#111", textDecoration: "none",
            }}>
              {t.pricing.pro.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid #f0f0f0",
        padding: "40px 24px",
        textAlign: "center",
      }}>
        <p style={{ fontWeight: 800, fontSize: "18px", marginBottom: "8px" }}>ModaSoft</p>
        <p style={{ fontSize: "14px", color: "#888", marginBottom: "16px" }}>{t.footer.desc}</p>
        <p style={{ fontSize: "13px", color: "#bbb" }}>
          © {new Date().getFullYear()} ModaSoft. {t.footer.rights}
        </p>
      </footer>
    </div>
  )
}