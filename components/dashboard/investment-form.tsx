"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Upload } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import { WalletDisplay } from "@/components/wallet-display"

interface InvestmentFormProps {
  userId: string
  currentBalance: number
  lang?: Language
}

export function InvestmentForm({ userId, currentBalance, lang = "en" }: InvestmentFormProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("USDT_TRC20")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshot(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadScreenshot = async (file: File) => {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `payment-proofs/${fileName}`

    const { error: uploadError } = await supabase.storage.from("investments").upload(filePath, file)

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from("investments").getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const investmentAmount = Number(amount)

    // Validation
    if (investmentAmount < 100) {
      setError(t("minimumAmount") + " $100")
      setIsLoading(false)
      return
    }

    if (!screenshot) {
      setError(t("pleaseUploadProof"))
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Upload screenshot
      const screenshotUrl = await uploadScreenshot(screenshot)

      const { data: investment, error: investmentError } = await supabase
        .from("investments")
        .insert({
          user_id: userId,
          amount: investmentAmount,
          daily_return: 0, // Will be set by admin daily (variable up to 5%)
          total_days: 30,
          days_completed: 0,
          status: "pending", // Changed to pending until admin verifies payment
          payment_method: paymentMethod,
          payment_proof_url: screenshotUrl,
          verified: false,
          next_payout_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (investmentError) throw investmentError

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: userId,
        type: "deposit",
        amount: investmentAmount,
        description: `Investment pending verification - ${paymentMethod}`,
        reference_id: investment.id,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push(`/dashboard/invest/${investment.id}`)
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("[v0] Error creating investment:", error)
      setError(error instanceof Error ? error.message : "Failed to create investment")
    } finally {
      setIsLoading(false)
    }
  }

  const estimatedDaily = Number(amount) * 0.05 // Up to 5%
  const estimatedTotal = Number(amount) * 1.5 // 150% total return

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>{t("investmentCreated")}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">{t("investmentAmount")} (USD)</Label>
        <Input
          id="amount"
          type="number"
          min="100"
          step="0.01"
          placeholder="100.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={isLoading || success}
        />
        <p className="text-sm text-slate-600">{t("minimumAmount")}: $100</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">{t("paymentMethod")}</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isLoading || success}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USDT_TRC20">{t("usdtTrc20")}</SelectItem>
            <SelectItem value="BTC">{t("btc")}</SelectItem>
            <SelectItem value="ETH">{t("eth")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <WalletDisplay paymentMethod={paymentMethod} lang={lang} />

      <div className="space-y-2">
        <Label htmlFor="screenshot">{t("uploadScreenshot")}</Label>
        <div className="flex items-center gap-4">
          <label htmlFor="screenshot-upload">
            <Button type="button" variant="outline" disabled={isLoading || success} asChild>
              <span className="gap-2">
                <Upload className="h-4 w-4" />
                {screenshot ? (lang === "ar" ? "تغيير لقطة الشاشة" : "Change Screenshot") : t("uploadScreenshot")}
              </span>
            </Button>
            <input
              id="screenshot-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isLoading || success}
            />
          </label>
          {screenshot && <span className="text-sm text-green-600">✓ {screenshot.name}</span>}
        </div>
        {previewUrl && (
          <div className="mt-2">
            <img src={previewUrl || "/placeholder.svg"} alt="Payment proof" className="max-h-48 rounded border" />
          </div>
        )}
      </div>

      {amount && Number(amount) >= 100 && (
        <div className="rounded-lg bg-slate-50 p-4 space-y-3">
          <h3 className="font-semibold text-slate-900">{t("estimatedReturns")}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">{t("dailyReturn")}:</span>
              <span className="font-medium text-green-600">${estimatedDaily.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">{t("totalAfter30Days")}:</span>
              <span className="font-medium text-green-600">${estimatedTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-slate-600">{t("totalProfit")}:</span>
              <span className="font-semibold text-green-600">
                ${(estimatedTotal - Number(amount)).toFixed(2)} (+50%)
              </span>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || success || !amount || Number(amount) < 100 || !screenshot}
      >
        {isLoading
          ? lang === "ar"
            ? "جاري إنشاء الاستثمار..."
            : "Creating Investment..."
          : success
            ? lang === "ar"
              ? "تم إنشاء الاستثمار!"
              : "Investment Created!"
            : t("createInvestment")}
      </Button>

      <p className="text-xs text-slate-600 text-center">
        {lang === "ar"
          ? "سيتم التحقق من استثمارك من قبل المسؤول بعد مراجعة إثبات الدفع. تتفاوت العوائد اليومية حتى 5٪."
          : "Your investment will be verified by admin after reviewing your payment proof. Daily returns vary up to 5%."}
      </p>
    </form>
  )
}
