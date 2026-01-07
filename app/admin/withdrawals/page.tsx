import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminNav } from "@/components/admin/admin-nav"
import { LogoutButton } from "@/components/dashboard/logout-button"
import { Badge } from "@/components/ui/badge"
import { WithdrawalActions } from "@/components/admin/withdrawal-actions"
import Link from "next/link"
import Image from "next/image"
import logo from "@/public/logo.png"

export default async function AdminWithdrawalsPage() {
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

  // Get all withdrawals
  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select(`
      *,
      users!withdrawals_user_id_fkey (
        full_name
      )
    `)
    .order("requested_at", { ascending: false })

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
        <main className="flex-1 md:p-8 bg-slate-50">
          <div className="mb-8 p-6">
            <h1 className="text-3xl font-bold text-slate-900">Withdrawal Management</h1>
            <p className="text-slate-600 mt-1">Process withdrawal requests</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Withdrawals</CardTitle>
              <CardDescription>Total: {withdrawals?.length || 0} withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawals && withdrawals.length > 0 ? (
                <div className="space-y-6">
                  {withdrawals.map((withdrawal) => (
                    <Card key={withdrawal.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="font-semibold text-slate-900">{withdrawal.users?.full_name}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              Requested: {new Date(withdrawal.requested_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900">
                              ${Number(withdrawal.amount).toFixed(2)}
                            </div>
                            <Badge
                              variant={
                                withdrawal.status === "pending"
                                  ? "secondary"
                                  : withdrawal.status === "approved"
                                    ? "default"
                                    : withdrawal.status === "completed"
                                      ? "default"
                                      : "destructive"
                              }
                              className={
                                withdrawal.status === "pending"
                                  ? "bg-orange-100 text-orange-700"
                                  : withdrawal.status === "approved"
                                    ? "bg-blue-100 text-blue-700"
                                    : withdrawal.status === "completed"
                                      ? "bg-green-100 text-green-700"
                                      : ""
                              }
                            >
                              {withdrawal.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2 pt-4 border-t">
                          <div className="flex justify-between text-sm text-wrap">
                            <span className="text-slate-600">Wallet Address:</span>
                            <span className="font-mono md:text-sm text-[9px] text-slate-900">{withdrawal.wallet_address}</span>
                          </div>
                          {withdrawal.admin_note && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Admin Note:</span>
                              <span className="text-slate-900">{withdrawal.admin_note}</span>
                            </div>
                          )}
                          {withdrawal.processed_at && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Processed:</span>
                              <span className="text-slate-900">
                                {new Date(withdrawal.processed_at).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        {withdrawal.status === "pending" && (
                          <div className="mt-4 pt-4 border-t">
                            <WithdrawalActions
                              withdrawalId={withdrawal.id}
                              userId={withdrawal.user_id}
                              amount={Number(withdrawal.amount)}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-600">No withdrawal requests</p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
