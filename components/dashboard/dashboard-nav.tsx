"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, TrendingUp, ArrowDownToLine, History, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n"

export function DashboardNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    {
      title: t("overview"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("invest"),
      href: "/dashboard/invest",
      icon: TrendingUp,
    },
    {
      title: t("withdraw"),
      href: "/dashboard/withdraw",
      icon: ArrowDownToLine,
    },
    {
      title: t("history"),
      href: "/dashboard/history",
      icon: History,
    },
    {
      title: t("profile"),
      href: "/dashboard/profile",
      icon: User,
    },
  ]

  return (
    <aside className="flex md:w-64 w-full flex-col border-r bg-white p-6">
      <nav className="space-y-2 md:block flex flex-col">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-myColor text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
