"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  Brain,
  LogOut,
} from "lucide-react"
import { clsx } from "clsx"
import { useSession, signOut } from "next-auth/react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/compras", label: "Compras", icon: Truck },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/inteligencia", label: "Inteligencia IA", icon: Brain },
  { href: "/configuracion", label: "Configuración", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

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

      <div className="p-4 border-t space-y-3" style={{ borderColor: "var(--sidebar-border)" }}>
        {session?.user && (
          <div className="px-2">
            <p className="text-sm font-medium" style={{ color: "var(--sidebar-foreground)" }}>
              {session.user.name}
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {(session.user as any).role || "Usuario"}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: "var(--muted-foreground)" }}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}