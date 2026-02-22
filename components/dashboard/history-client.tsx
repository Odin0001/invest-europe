"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function HistoryClient({ transactions }: { transactions: any[] }) {
  const { t } = useLanguage()

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
      deposit: t("deposit"),
      withdrawal: t("withdrawal"),
      daily_return: t("dailyReturn"),
      admin_credit: t("adminDeposit"),
      admin_debit: t("adminWithdrawal"),
    }
    return typeMap[type] || type.replace("_", " ")
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t("transactionHistory")}</h1>
        <p className="text-slate-600 mt-1">{t("viewAllFinancialActivities")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("allTransactions")}</CardTitle>
          <CardDescription>{t("completeHistoryOfActivity")}</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const style = getTransactionStyle(transaction.type)
                const Icon = style.icon

                return (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${style.bgColor}`}>
                        <Icon className={`h-5 w-5 ${style.iconColor}`} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 capitalize">
                          {formatTransactionType(transaction.type)}
                        </div>
                        <div className="text-sm text-slate-600">
                          {new Date(transaction.created_at).toLocaleString()}
                        </div>
                        {/* {transaction.description && (
                          <div className="text-xs text-slate-500 mt-1">{transaction.description}</div>
                        )} */}
                      </div>
                    </div>
                    <div className={`font-medium ${style.amountColor}`}>
                      {style.prefix}${Number(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-slate-600">{t("noTransactionsYet")}</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
