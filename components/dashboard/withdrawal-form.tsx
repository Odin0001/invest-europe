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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WithdrawalFormProps {
  userId: string
  currentBalance: number
}

const PAYMENT_METHODS = [
  { value: "ERC20", label: "ERC20" },
  { value: "TRX", label: "TRX (Tron)" },
  { value: "SOL", label: "SOL (Solana)" },
  { value: "USDT_BEP20", label: "USDT (BEP20)" },
  { value: "USDT_TRC20", label: "USDT (TRC20)" },
]

export function WithdrawalForm({ userId, currentBalance }: WithdrawalFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [userWalletAddress, setUserWalletAddress] = useState("")
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const withdrawalAmount = Number(amount)

    // Validation
    if (!paymentMethod) {
      setError("Please select a payment method")
      setIsLoading(false)
      return
    }

    if (!userWalletAddress.trim()) {
      setError("Please enter a wallet address")
      setIsLoading(false)
      return
    }

    if (withdrawalAmount < 5) {
      setError("Minimum withdrawal amount is $5")
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
        wallet_address: userWalletAddress.trim(),
        payment_method: paymentMethod,
        status: "pending",
      })

      if (withdrawalError) throw withdrawalError

      setSuccess(true)
      setAmount("")
      setUserWalletAddress("")
      setPaymentMethod("")
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
        <Label htmlFor="paymentMethod">{t("paymentMethod")}</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="walletAddress">{t("walletAddress")}</Label>
        <Input
          id="walletAddress"
          type="text"
          placeholder="Enter your wallet address"
          value={userWalletAddress}
          onChange={(e) => setUserWalletAddress(e.target.value)}
          disabled={isLoading || success}
          className="font-mono text-sm"
        />
        <p className="text-sm text-slate-600">{t("funds")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t("withdrawalAmount")}</Label>
        <Input
          id="amount"
          type="number"
          min="5"
          step="0.01"
          placeholder="5.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          disabled={isLoading || success}
        />
        <p className="text-sm text-slate-600">
          {t("minimumAvailable")} ${currentBalance.toFixed(2)}
        </p>
      </div>

      {amount && Number(amount) >= 5 && (
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

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || success || !amount || Number(amount) < 5 || !paymentMethod || !userWalletAddress.trim()}
      >
        {isLoading ? "Submitting Request..." : success ? "Request Submitted!" : t("requestWithdrawalButton")}
      </Button>

      <p className="text-xs text-slate-600 text-center">{t("withdrawalNote")}</p>
    </form>
  )
}
