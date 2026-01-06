import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, AlertCircle } from "lucide-react"
import { AdminNav } from "@/components/admin/admin-nav"
import { LogoutButton } from "@/components/dashboard/logout-button"
import Link from "next/link"
import Image from "next/image"
import logo from "@/public/logo.png"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // Get total users
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

  const { data: allUsers } = await supabase.from("users").select("total_invested").eq("is_admin", false)
  const totalInvested = allUsers?.reduce((sum, u) => sum + Number(u.total_invested || 0), 0) || 0

  // Get pending withdrawals
  const { count: pendingWithdrawals } = await supabase
    .from("withdrawals")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto h-16 flex items-center justify-between px-4 md:px-6">
          <Link href="/"><Image src={logo.src} alt="InvestPro Logo" width={60} height={50} className="" /></Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-slate-600">{profile?.full_name || user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex md:flex-row flex-col flex-1">
        <AdminNav />
        <main className="flex-1 p-6 md:p-8 bg-slate-50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage platform operations</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
                <Users className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalUsers || 0}</div>
                <p className="text-xs text-slate-600 mt-1">Registered accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Invested</CardTitle>
                <DollarSign className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">${totalInvested.toFixed(2)}</div>
                <p className="text-xs text-slate-600 mt-1">Sum of all user balances</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pending Withdrawals</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{pendingWithdrawals || 0}</div>
                <p className="text-xs text-slate-600 mt-1">Requires action</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
