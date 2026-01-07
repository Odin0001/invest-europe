import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { HistoryClient } from "@/components/dashboard/history-client"

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getTransactionStyle = (type: string) => {
    switch (type) {
      case "deposit":
      case "daily_return":
        return {
          icon: ArrowUpRight,
          bgColor: "bg-green-100",
          iconColor: "text-green-600",
          amountColor: "text-green-600",
          prefix: "+",
        }
      case "withdrawal":
        return {
          icon: ArrowDownRight,
          bgColor: "bg-red-100",
          iconColor: "text-red-600",
          amountColor: "text-red-600",
          prefix: "-",
        }
      default:
        return {
          icon: TrendingUp,
          bgColor: "bg-slate-100",
          iconColor: "text-slate-600",
          amountColor: "text-slate-900",
          prefix: "",
        }
    }
  }

  const formatTransactionType = (type: string) => {
    const typeMap: Record<string, string> = {
      deposit: "Deposit",
      withdrawal: "Withdrawal",
      daily_return: "Daily Return",
      admin_credit: "Admin Deposit",
      admin_debit: "Admin Withdrawal",
    }
    return typeMap[type] || type.replace("_", " ")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={profile?.full_name || user.email || undefined} />

      <div className="flex md:flex-row flex-col flex-1">
        <DashboardNav />
        <main className="flex-1 p-6 md:p-8 bg-slate-50">
          <HistoryClient transactions={transactions || []} />
        </main>
      </div>
    </div>
  )
}
