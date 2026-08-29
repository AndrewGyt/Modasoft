"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
} from "lucide-react"
import { clsx } from "clsx"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/compras", label: "Compras", icon: Truck },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r flex flex-col" style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}>
      <div className="p-6 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--sidebar-foreground)" }}>ModaSoft</h1>
        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Tendance</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              )}
              style={{
                background: isActive ? "var(--sidebar-primary)" : "transparent",
                color: isActive ? "var(--sidebar-primary-foreground)" : "var(--sidebar-foreground)",
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: "var(--sidebar-border)", color: "var(--muted-foreground)" }}>
        <p className="text-xs">ModaSoft v1.0</p>
      </div>
    </aside>
  )
}