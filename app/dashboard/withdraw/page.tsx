import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { WithdrawClient } from "@/components/dashboard/withdraw-client"

export default async function WithdrawPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get withdrawal history
  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("*")
    .eq("user_id", user.id)
    .order("requested_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={profile?.full_name || user.email || undefined} />

      <div className="flex flex-1">
        <DashboardNav />
        <main className="flex-1 p-6 md:p-8 bg-slate-50">
          <WithdrawClient userId={user.id} profile={profile} withdrawals={withdrawals || []} />
        </main>
      </div>
    </div>
  )
}
