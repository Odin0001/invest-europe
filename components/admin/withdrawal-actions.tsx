"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface WithdrawalActionsProps {
  withdrawalId: string
  userId: string
  amount: number
}

export function WithdrawalActions({ withdrawalId, userId, amount }: WithdrawalActionsProps) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    const supabase = createClient()

    try {
      // Update withdrawal status
      const { error: updateError } = await supabase
        .from("withdrawals")
        .update({
          status: "completed",
          admin_note: note || "Approved and processed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId)

      if (updateError) throw updateError

      // Deduct from user balance
      const { data: user } = await supabase.from("users").select("balance, total_withdrawn").eq("id", userId).single()

      if (user) {
        const { error: balanceError } = await supabase
          .from("users")
          .update({
            balance: Number(user.balance) - amount,
            total_withdrawn: Number(user.total_withdrawn) + amount,
          })
          .eq("id", userId)

        if (balanceError) throw balanceError
      }

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: userId,
        type: "withdrawal",
        amount: amount,
        description: `Withdrawal completed - ${note || "Approved"}`,
        reference_id: withdrawalId,
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Error approving withdrawal:", error)
      alert("Failed to approve withdrawal")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!note.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    setIsProcessing(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("withdrawals")
        .update({
          status: "rejected",
          admin_note: note,
          processed_at: new Date().toISOString(),
        })
        .eq("id", withdrawalId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Error rejecting withdrawal:", error)
      alert("Failed to reject withdrawal")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="note">Admin Note</Label>
        <Textarea
          id="note"
          placeholder="Add a note (optional for approval, required for rejection)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2"
        />
      </div>
      <div className="flex gap-3">
        <Button onClick={handleApprove} disabled={isProcessing} className="flex-1">
          {isProcessing ? "Processing..." : "Approve & Complete"}
        </Button>
        <Button onClick={handleReject} disabled={isProcessing} variant="destructive" className="flex-1">
          {isProcessing ? "Processing..." : "Reject"}
        </Button>
      </div>
    </div>
  )
}
