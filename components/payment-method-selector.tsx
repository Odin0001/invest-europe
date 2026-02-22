"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { WalletDisplay } from "@/components/wallet-display"
import { useTranslation, type Language } from "@/lib/i18n"

interface PaymentMethodSelectorProps {
  lang?: Language
}

export function PaymentMethodSelector({ lang = "en" }: PaymentMethodSelectorProps) {
  const { t } = useTranslation()
  const [paymentMethod, setPaymentMethod] = useState("ERC20")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">{t("paymentMethod")}</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ERC20">{t("erc20")}</SelectItem>
            <SelectItem value="TRX">{t("trx")}</SelectItem>
            <SelectItem value="SOL">{t("sol")}</SelectItem>
            <SelectItem value="USDT_BEP20">{t("usdtBep20")}</SelectItem>
            <SelectItem value="USDT_TRC20">{t("usdtTrc20")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <WalletDisplay paymentMethod={paymentMethod} lang={lang} />
    </div>
  )
}
