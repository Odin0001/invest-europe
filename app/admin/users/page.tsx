"use client"

import { TableRow, TableHead } from "@/components/ui/table"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminNav } from "@/components/admin/admin-nav"
import { LogoutButton } from "@/components/dashboard/logout-button"
import { Wallet, Search, DollarSign, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Table, TableBody, TableCell, TableHeader } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"
import logo from "@/public/logo.png"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [globalReturnRate, setGlobalReturnRate] = useState("")
  const [isApplyingGlobal, setIsApplyingGlobal] = useState(false)

  // Dialog state
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [balanceAmount, setBalanceAmount] = useState("")
  const [returnRate, setReturnRate] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const supabase = createClient()
  const router = useRouter()
  const { t, language } = useLanguage()

  useEffect(() => {
    async function loadData() {
      const { data: usersData, error } = await supabase
        .from("users")
        .select("*")
        .eq("is_admin", false)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching users:", error)
        return
      }

      setUsers(usersData || [])
      setFilteredUsers(usersData || [])
    }

    loadData()
  }, [router, supabase])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = users.filter((user) => {
      const fullName = user.full_name?.toLowerCase() || ""
      return fullName.includes(query)
    })

    setFilteredUsers(filtered)
  }, [searchQuery, users])

  const applyGlobalReturn = async () => {
    const percentage = Number.parseFloat(globalReturnRate)

    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast({
        title: t("returnAppliedError"),
        description: "Please enter a valid percentage between 0 and 100",
        variant: "destructive",
      })
      return
    }

    setIsApplyingGlobal(true)

    try {
      const { data: usersData, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .gt("total_invested", 0)
        .eq("is_admin", false)

      if (fetchError || !usersData || usersData.length === 0) {
        toast({
          title: t("returnAppliedError"),
          description: fetchError?.message || "No users with investments found",
          variant: "destructive",
        })
        setIsApplyingGlobal(false)
        return
      }

      for (const user of usersData) {
        const returnAmount = (Number(user.total_invested) * percentage) / 100
        const newBalance = Number(user.balance) + returnAmount

        await supabase.from("users").update({ balance: newBalance }).eq("id", user.id)

        await supabase.from("transactions").insert({
          user_id: user.id,
          type: "daily_return",
          amount: returnAmount,
          description: `Global daily return ${percentage}% on invested amount`,
        })
      }

      toast({
        title: t("returnAppliedSuccess"),
        description: `Applied ${percentage}% return to ${usersData.length} users`,
      })

      setGlobalReturnRate("")

      const { data: refreshedUsers } = await supabase
        .from("users")
        .select("*")
        .eq("is_admin", false)
        .order("created_at", { ascending: false })

      if (refreshedUsers) {
        setUsers(refreshedUsers)
        setFilteredUsers(refreshedUsers)
      }
    } catch (error) {
      console.error("[v0] Error applying global return:", error)
      toast({
        title: t("returnAppliedError"),
        description: "Failed to apply return. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApplyingGlobal(false)
    }
  }

  const updateUserBalance = async () => {
    if (!selectedUser) return

    const newAmount = Number.parseFloat(balanceAmount)
    if (isNaN(newAmount) || newAmount < 0) {
      toast({
        title: t("balanceUpdateError"),
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    try {
      const oldInvested = Number(selectedUser.total_invested)
      const oldBalance = Number(selectedUser.balance)
      const difference = newAmount - oldInvested
      const newBalance = oldBalance + difference

      await supabase
        .from("users")
        .update({
          total_invested: newAmount,
          balance: newBalance,
        })
        .eq("id", selectedUser.id)

      await supabase.from("transactions").insert({
        user_id: selectedUser.id,
        type: difference >= 0 ? "deposit" : "withdrawal",
        amount: Math.abs(difference),
        description:
          difference >= 0
            ? `Admin set invested amount to $${newAmount.toFixed(2)}`
            : `Admin set invested amount to $${newAmount.toFixed(2)}`,
      })

      toast({
        title: t("balanceUpdated"),
        description: `Invested amount updated to $${newAmount.toFixed(2)}`,
      })

      const { data: refreshedUsers } = await supabase
        .from("users")
        .select("*")
        .eq("is_admin", false)
        .order("created_at", { ascending: false })

      if (refreshedUsers) {
        setUsers(refreshedUsers)
        setFilteredUsers(refreshedUsers)
      }

      setIsDialogOpen(false)
      setBalanceAmount("")
    } catch (error) {
      console.error("[v0] Error updating invested amount:", error)
      toast({
        title: t("balanceUpdateError"),
        description: "Failed to update invested amount. Please try again.",
        variant: "destructive",
      })
    }
  }

  const applyUserReturn = async () => {
    if (!selectedUser) return

    const percentage = Number.parseFloat(returnRate)
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast({
        title: t("returnAppliedError"),
        description: "Please enter a valid percentage between 0 and 100",
        variant: "destructive",
      })
      return
    }

    try {
      if (Number(selectedUser.total_invested) <= 0) {
        toast({
          title: t("returnAppliedError"),
          description: "User has no invested amount",
          variant: "destructive",
        })
        return
      }

      const returnAmount = (Number(selectedUser.total_invested) * percentage) / 100
      const newBalance = Number(selectedUser.balance) + returnAmount

      await supabase.from("users").update({ balance: newBalance }).eq("id", selectedUser.id)

      await supabase.from("transactions").insert({
        user_id: selectedUser.id,
        type: "daily_return",
        amount: returnAmount,
        description: `Daily return ${percentage}% on invested amount`,
      })

      toast({
        title: t("returnAppliedSuccess"),
        description: `Applied ${percentage}% return ($${returnAmount.toFixed(2)})`,
      })

      const { data: refreshedUsers } = await supabase
        .from("users")
        .select("*")
        .eq("is_admin", false)
        .order("created_at", { ascending: false })

      if (refreshedUsers) {
        setUsers(refreshedUsers)
        setFilteredUsers(refreshedUsers)
      }

      setIsDialogOpen(false)
      setReturnRate("")
    } catch (error) {
      console.error("[v0] Error applying user return:", error)
      toast({
        title: t("returnAppliedError"),
        description: "Failed to apply return. Please try again.",
        variant: "destructive",
      })
    }
  }

  const clearUserBalance = async (user: any) => {
    if (!confirm(t("confirmClearBalance"))) {
      return
    }

    try {
      const oldInvested = Number(user.total_invested)
      const oldBalance = Number(user.balance)

      await supabase
        .from("users")
        .update({
          total_invested: 0,
          balance: 0,
        })
        .eq("id", user.id)

      if (oldInvested > 0 || oldBalance > 0) {
        await supabase.from("transactions").insert({
          user_id: user.id,
          type: "withdrawal",
          amount: oldBalance,
          description: `Admin cleared all balances (Invested: $${oldInvested.toFixed(2)}, Balance: $${oldBalance.toFixed(2)})`,
        })
      }

      toast({
        title: t("balanceCleared"),
        description: "Both invested amount and balance have been set to $0.00",
      })

      const { data: refreshedUsers } = await supabase
        .from("users")
        .select("*")
        .eq("is_admin", false)
        .order("created_at", { ascending: false })

      if (refreshedUsers) {
        setUsers(refreshedUsers)
        setFilteredUsers(refreshedUsers)
      }
    } catch (error) {
      console.error("[v0] Error clearing balance:", error)
      toast({
        title: t("clearBalanceError"),
        description: "Failed to clear balance. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/"><Image src={logo.src} alt="InvestPro Logo" width={60} height={50} className="" /></Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="hidden sm:inline text-sm text-slate-600">Admin</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex md:flex-row flex-col flex-1">
        <AdminNav />
        <main className="flex-1 p-6 md:p-8 bg-slate-50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">{t("searchUsers")}</h1>
            <p className="text-slate-600 mt-1">View and manage platform users</p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={t("searchByName")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t("globalDailyReturn")}
              </CardTitle>
              <CardDescription>{t("applyToAllUsers")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="number"
                  placeholder={t("enterPercentage")}
                  value={globalReturnRate}
                  onChange={(e) => setGlobalReturnRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="max-w-xs"
                />
                <Button onClick={applyGlobalReturn} disabled={isApplyingGlobal || !globalReturnRate}>
                  {isApplyingGlobal ? t("applyingReturn") : t("applyReturn")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("totalUsers")}</CardTitle>
              <CardDescription>
                {t("totalUsers")}: {filteredUsers?.length || 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers && filteredUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("fullName")}</TableHead>
                      <TableHead className="text-right">{t("balance")}</TableHead>
                      <TableHead className="text-right">{t("totalInvested")}</TableHead>
                      <TableHead className="text-right">{t("walletAddress")}</TableHead>
                      <TableHead className="text-right">{t("memberSince")}</TableHead>
                      <TableHead className="text-right">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell className="font-medium">{userItem.full_name}</TableCell>
                        <TableCell className="text-right">${userItem.balance?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell className="text-right">${userItem.total_invested?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Wallet className="h-3 w-3" />
                            {userItem.wallet_address ? `${userItem.wallet_address.substring(0, 10)}...` : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {new Date(userItem.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(userItem)
                                  setBalanceAmount(userItem.total_invested?.toString() || "0")
                                  setReturnRate("")
                                  setIsDialogOpen(true)
                                }}
                              >
                                {t("manageUser")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => clearUserBalance(userItem)}>
                                {t("clearBalance")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-slate-600">{t("noUsersFound")}</p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("manageUser")}: {selectedUser?.full_name}
            </DialogTitle>
            <DialogDescription>Update balance or apply daily return for this user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("adjustBalance")}</label>
              <Input
                type="number"
                placeholder={t("enterNewBalance")}
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                min="0"
                step="0.01"
              />
              <Button onClick={updateUserBalance} className="w-full">
                {t("updateBalance")}
              </Button>
            </div>
            <div className="border-t pt-4 space-y-2">
              <label className="text-sm font-medium">{t("applyDailyReturn")}</label>
              <Input
                type="number"
                placeholder={t("enterPercentage")}
                value={returnRate}
                onChange={(e) => setReturnRate(e.target.value)}
                min="0"
                max="100"
                step="0.01"
              />
              <Button onClick={applyUserReturn} className="w-full">
                {t("applyReturn")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
