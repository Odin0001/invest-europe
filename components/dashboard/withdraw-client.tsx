"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WithdrawalForm } from "@/components/dashboard/withdrawal-form"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/i18n"

export function WithdrawClient({
  userId,
  profile,
  withdrawals,
}: {
  userId: string
  profile: any
  withdrawals: any[]
}) {
  const { t } = useLanguage()

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t("withdrawFunds")}</h1>
        <p className="text-slate-600 mt-1">{t("requestWithdrawalToWallet")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("newWithdrawal")}</CardTitle>
              <CardDescription>{t("enterAmount")}</CardDescription>
            </CardHeader>
            <CardContent>
              <WithdrawalForm
                userId={userId}
                currentBalance={Number(profile?.balance || 0)}
                walletAddress={profile?.wallet_address || ""}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("withdrawalHistory")}</CardTitle>
              <CardDescription>{t("pastWithdrawals")}</CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawals && withdrawals.length > 0 ? (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <div className="font-medium text-slate-900">${Number(withdrawal.amount).toFixed(2)}</div>
                        <div className="text-sm text-slate-600">
                          {new Date(withdrawal.requested_at).toLocaleDateString()}
                        </div>
                        {withdrawal.admin_note && (
                          <div className="text-xs text-slate-500 mt-1">
                            {t("note")}: {withdrawal.admin_note}
                          </div>
                        )}
                      </div>
                      <div>
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
                          {t(withdrawal.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-600">{t("noPastWithdrawals")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("accountBalance")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${Number(profile?.balance || 0).toFixed(2)}</div>
              <p className="text-sm text-slate-600 mt-2">{t("availableForWithdrawal")}</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">{t("withdrawalInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-900">
              <p>
                <strong>{t("processingTime")}:</strong> {t("businessDays")}
              </p>
              <p>
                <strong>{t("minimumAmount10")}</strong>
              </p>
              <p>
                <strong>{t("statusUpdates")}</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("yourWallet")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm text-slate-900 break-all bg-slate-100 p-3 rounded">
                {profile?.wallet_address || t("noWalletSet")}
              </div>
              <p className="text-xs text-slate-600 mt-2">{t("thisIsYourRegisteredWallet")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
