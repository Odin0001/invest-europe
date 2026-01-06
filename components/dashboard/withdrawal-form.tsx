"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface WithdrawalFormProps {
  userId: string
  currentBalance: number
  walletAddress: string
}

export function WithdrawalForm({ userId, currentBalance, walletAddress }: WithdrawalFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const withdrawalAmount = Number(amount)

    // Validation
    if (!walletAddress) {
      setError("No wallet address found. Please contact support to set up your wallet.")
      setIsLoading(false)
      return
    }

    if (withdrawalAmount < 10) {
      setError("Minimum withdrawal amount is $10")
      setIsLoading(false)
      return
    }

    if (withdrawalAmount > currentBalance) {
      setError("Insufficient balance")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Create withdrawal request
      const { error: withdrawalError } = await supabase.from("withdrawals").insert({
        user_id: userId,
        amount: withdrawalAmount,
        wallet_address: walletAddress,
        status: "pending",
      })

      if (withdrawalError) throw withdrawalError

      setSuccess(true)
      setAmount("")
      setTimeout(() => {
        router.refresh()
        setSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("[v0] Error creating withdrawal:", error)
      setError(error instanceof Error ? error.message : "Failed to create withdrawal request")
    } finally {
      setIsLoading(false)
    }
  }

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
          <AlertDescription>
            Withdrawal request submitted successfully! An admin will review your request shortly.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">{t("withdrawalAmount")}</Label>
        <Input
          id="amount"
          type="number"
          min="10"
          step="0.01"
          placeholder="10.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={isLoading || success}
        />
        <p className="text-sm text-slate-600">{t("minimumAvailable")} ${currentBalance.toFixed(2)}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="wallet">{t("walletAddress")}</Label>
        <Input id="wallet" value={walletAddress} disabled className="font-mono text-sm" />
        <p className="text-sm text-slate-600">{t("funds")}</p>
      </div>

      {amount && Number(amount) >= 10 && (
        <div className="rounded-lg bg-slate-50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">{t("withdrawalAmount")}</span>
            <span className="font-medium text-slate-900">${Number(amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">{t("processingTime")}</span>
            <span className="font-medium text-slate-900">{t("businessDays")}</span>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || success || !amount || Number(amount) < 10}>
        {isLoading ? "Submitting Request..." : success ? "Request Submitted!" : t("requestWithdrawalButton")}
      </Button>

      <p className="text-xs text-slate-600 text-center">
        {t("withdrawalNote")}
      </p>
    </form>
  )
}
