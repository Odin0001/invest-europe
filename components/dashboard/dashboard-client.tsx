"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"

export default function DashboardClient({
  profile,
  transactions,
  todaysEarnings,
}: {
  profile: any
  transactions: any[]
  todaysEarnings: number
}) {
  const { t } = useLanguage()

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t("dashboard")}</h1>
        <p className="text-slate-600 mt-1">
          {t("welcomeBackInvestor")}, {profile?.full_name || t("dashboard")}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{t("availableBalance")}</CardTitle>
            <Wallet className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${Number(profile?.balance || 0).toFixed(2)}</div>
            <p className="text-xs text-slate-600 mt-1">{t("readyToInvestOrWithdraw")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{t("totalInvested")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${Number(profile?.total_invested || 0).toFixed(2)}</div>
            <p className="text-xs text-slate-600 mt-1">{t("baseInvestmentAmount")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{t("todaysEarnings")}</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${todaysEarnings.toFixed(2)}</div>
            <p className="text-xs text-slate-600 mt-1">{t("fromDailyReturns")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("quickActions")}</CardTitle>
            <CardDescription>{t("manageYourInvestments")}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild className="flex-1">
              <Link href="/dashboard/invest">{t("newInvestment")}</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/dashboard/withdraw">{t("withdraw")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentTransactions")}</CardTitle>
          <CardDescription>{t("yourLatestActivities")}</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {transaction.type === "deposit" || transaction.type === "daily_return" ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-900 capitalize">
                        {transaction.type === "daily_return" ? t("dailyReturn") : transaction.type.replace("_", " ")}
                      </div>
                      <div className="text-sm text-slate-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-medium ${
                      transaction.type === "deposit" || transaction.type === "daily_return"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "deposit" || transaction.type === "daily_return" ? "+" : "-"}$
                    {Number(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-slate-600">{t("noTransactions")}</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
