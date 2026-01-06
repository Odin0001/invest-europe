"use client"

import { LogoutButton } from "./logout-button"
import { LanguageSwitcher } from "@/components/language-switcher"
import Link from "next/link"
import Image from "next/image"
import logo from "@/public/logo.png"

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/"><Image src={logo.src} alt="InvestPro Logo" width={60} height={50} className="" /></Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-slate-600">{userName}</span>
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
