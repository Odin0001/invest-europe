import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import DashboardClient from "@/components/dashboard/dashboard-client"

export default async function DashboardPage() {
  let user
  let profile
  let transactions
  let todaysEarnings = 0

  try {
    const supabase = await createClient()

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      console.log("[v0] Auth error:", authError)
      redirect("/auth/login")
    }

    user = authUser

    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.log("[v0] Profile error:", profileError)
    }
    profile = profileData

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const { data: todaysTransactions } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "daily_return")
      .gte("created_at", startOfToday.toISOString())

    todaysEarnings = todaysTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (transactionsError) {
      console.log("[v0] Transactions error:", transactionsError)
    }
    transactions = transactionsData
  } catch (error) {
    console.log("[v0] Unexpected error:", error)
    redirect("/auth/login")
  }

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={profile?.full_name || user.email || undefined} />

      <div className="flex md:flex-row flex-col flex-1">
        <DashboardNav />
        <main className="flex-1 p-6 md:p-8 bg-slate-50">
          <DashboardClient profile={profile} transactions={transactions || []} todaysEarnings={todaysEarnings} />
        </main>
      </div>
    </div>
  )
}
