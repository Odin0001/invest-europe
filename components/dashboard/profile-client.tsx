"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/i18n"

export function ProfileClient({ profile, user }: { profile: any; user: any }) {
  const { t } = useLanguage()

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t("profile")}</h1>
        <p className="text-slate-600 mt-1">{t("manageAccountInformation")}</p>
        <p className="text-slate-600 mt-1">{t("contact")} <span className="font-bold">asd@gmail.com</span></p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t("personalInformation")}</CardTitle>
            <CardDescription>{t("yourAccountDetails")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>{t("fullName")}</Label>
              <Input value={profile?.full_name || ""} disabled />
            </div>
            <div className="grid gap-2">
              <Label>{t("email")}</Label>
              <Input value={user.email || ""} disabled />
            </div>
            <div className="grid gap-2">
              <Label>{t("walletAddress")}</Label>
              <Input value={profile?.wallet_address || ""} disabled className="font-mono text-sm" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("accountStatistics")}</CardTitle>
            <CardDescription>{t("yourInvestmentJourney")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">{t("totalInvested")}</span>
              <span className="font-medium text-slate-900">${Number(profile?.total_invested || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">{t("totalWithdrawn")}</span>
              <span className="font-medium text-slate-900">${Number(profile?.total_withdrawn || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">{t("currentBalance")}</span>
              <span className="font-medium text-slate-900">${Number(profile?.balance || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">{t("memberSince")}</span>
              <span className="font-medium text-slate-900">
                {new Date(profile?.created_at || "").toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
