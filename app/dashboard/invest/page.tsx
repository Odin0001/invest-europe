"use client"

import type React from "react"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { PaymentMethodSelector } from "@/components/payment-method-selector"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useLanguage } from "@/lib/i18n"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, CheckCircle } from "lucide-react"

export default function InvestPage() {
  const { t, language } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Form state
  const [fullName, setFullName] = useState("")
  const [walletId, setWalletId] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        redirect("/auth/login")
        return
      }

      const { data: profileData } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      setUser(authUser)
      setProfile(profileData)
      setFullName(profileData?.full_name || "")
      setWalletId(profileData?.wallet_address || "")
      setLoading(false)
    }

    loadData()
  }, [])

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!screenshot || !fullName || !walletId) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("file", screenshot)

      const uploadResponse = await fetch("/api/upload-screenshot", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload screenshot")
      }

      const { url: screenshotUrl } = await uploadResponse.json()

      // Submit form data to API
      const response = await fetch("/api/submit-investment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          walletId,
          paymentScreenshot: screenshotUrl,
          userId: user?.id,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        // Reset form
        setFullName(profile?.full_name || "")
        setWalletId(profile?.wallet_address || "")
        setScreenshot(null)
        setScreenshotPreview(null)
      } else {
        alert("Failed to submit. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting:", error)
      alert("Error submitting. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={profile?.full_name || user?.email || undefined} />

      <div className="flex flex-1">
        <DashboardNav />
        <main className="flex-1 p-6 md:p-8 bg-slate-50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">{t("newInvestmentTitle")}</h1>
            <p className="text-slate-600 mt-1">{t("selectPaymentMethodDescription")}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("paymentInformation")}</CardTitle>
                  <CardDescription>{t("chooseYourPaymentMethod")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentMethodSelector lang={language} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("investmentDetailsTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-slate-600">{t("dailyReturn")}</span>
                    <span className="font-semibold text-slate-900">{t("upTo5Percent")}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-slate-600">{t("investmentPeriod")}</span>
                    <span className="font-semibold text-slate-900">{t("thirtyDays")}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-slate-600">{t("minimumAmount")}</span>
                    <span className="font-semibold text-slate-900">{t("minimumAmount100")}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">{t("howItWorks")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-blue-900">
                  <p>
                    1. <strong>{t("selectPaymentMethodStep")}</strong>
                  </p>
                  <p>
                    2. <strong>{t("copyWalletAddressStep")}</strong>
                  </p>
                  <p>
                    3. <strong>{t("sendPaymentStep")}</strong>
                  </p>
                  <p>
                    4. <strong>{t("submitFormStep")}</strong>
                  </p>
                  <p>
                    5. <strong>{t("earnDailyStep")}</strong>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900">{t("exampleReturns")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-green-900">
                  <div className="flex justify-between">
                    <span>{t("investment100")}</span>
                    <span className="font-semibold">{t("upTo5Day")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("investment1000")}</span>
                    <span className="font-semibold">{t("upTo50Day")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("investment10000")}</span>
                    <span className="font-semibold">{t("upTo500Day")}</span>
                  </div>
                  <div className="pt-3 border-t border-green-300">
                    <p className="font-semibold">{t("estimatedTotal")}</p>
                    <p className="text-xs mt-1">{t("dailyReturnsVary")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t("submitInvestment")}</CardTitle>
                  <CardDescription>{t("fillFormToSubmit")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("submissionSuccess")}</h3>
                      <p className="text-slate-600 mb-6">{t("adminWillContact")}</p>
                      <Button onClick={() => setSubmitted(false)}>{t("submitAnother")}</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">{t("fullName")}</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t("enterFullName")}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="walletId">{t("walletIdLabel")}</Label>
                        <Input
                          id="walletId"
                          value={walletId}
                          onChange={(e) => setWalletId(e.target.value)}
                          placeholder={t("enterWalletId")}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="screenshot">{t("paymentScreenshot")}</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="screenshot"
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotChange}
                            required
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("screenshot")?.click()}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {screenshot ? t("changeScreenshot") : t("uploadScreenshot")}
                          </Button>
                        </div>
                        {screenshotPreview && (
                          <div className="mt-4 border rounded-lg overflow-hidden">
                            <img
                              src={screenshotPreview || "/placeholder.svg"}
                              alt="Payment screenshot preview"
                              className="w-full h-auto"
                            />
                          </div>
                        )}
                      </div>

                      <Button type="submit" disabled={submitting || !screenshot} className="w-full">
                        {submitting ? t("submitting") : t("submitInvestment")}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
