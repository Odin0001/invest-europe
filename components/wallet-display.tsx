"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2 } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WalletDisplayProps {
  paymentMethod: string
  lang?: Language
}

const WALLET_DATA: Record<string, { addresses: string[] }> = {
  ERC20: {
    addresses: ["0xc37556e9bcf424a85422bc8855fdaf5bf8006bc6", "0xdb7b5151fe18ea3ba8dd2506a889dbe38bffdff9"],
  },
  TRX: {
    addresses: ["TQfhXCP9gQRRkARg5PnwADgX7w9zdNhc88", "TVfARfmWMrbNEGepb6PSrTxEvapCRCgkr8"],
  },
  SOL: {
    addresses: ["DnYYRssGDBZxz2XnUTGnxUtaM82M22avoA6U27E2qYov", "3p2CMzY2ogn5B1UYqLXGes5ejUTWmrwxYh9jz3JYLQCV"],
  },
  USDT_BEP20: {
    addresses: ["0xc37556e9bcf424a85422bc8855fdaf5bf8006bc6", "0xdb7b5151fe18ea3ba8dd2506a889dbe38bffdff9"],
  },
  USDT_TRC20: {
    addresses: ["TQfhXCP9gQRRkARg5PnwADgX7w9zdNhc88", "TVfARfmWMrbNEGepb6PSrTxEvapCRCgkr8"],
  },
}

export function WalletDisplay({ paymentMethod, lang = "en" }: WalletDisplayProps) {
  const { t } = useTranslation()
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0)
  const [copied, setCopied] = useState(false)

  const walletData = WALLET_DATA[paymentMethod]
  const selectedAddress = walletData?.addresses[selectedAddressIndex] || ""

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("[v0] Failed to copy:", err)
    }
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-900">{t("platformWallet")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert className="bg-white border-blue-300">
          <AlertDescription className="text-sm text-blue-900">{t("sendPaymentTo")}</AlertDescription>
        </Alert>

        {walletData && walletData.addresses.length > 1 && (
          <div className="space-y-2">
            <Label className="text-sm text-slate-700">{t("selectWalletAddress")}</Label>
            <div className="flex gap-2">
              {walletData.addresses.map((_, index) => (
                <Button
                  key={index}
                  variant={selectedAddressIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAddressIndex(index)}
                  className="flex-1"
                >
                  {t("option")} {index + 1}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-3 rounded-lg border border-blue-200">
          <div className="text-xs text-slate-600 mb-1">
            {paymentMethod === "ERC20" && t("erc20")}
            {paymentMethod === "TRX" && t("trx")}
            {paymentMethod === "SOL" && t("sol")}
            {paymentMethod === "USDT_BEP20" && t("usdtBep20")}
            {paymentMethod === "USDT_TRC20" && t("usdtTrc20")}
          </div>
          <div className="font-mono text-sm break-all text-slate-900 mb-2">{selectedAddress}</div>
          <Button onClick={handleCopy} variant="outline" size="sm" className="w-full bg-transparent">
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                {t("addressCopied")}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                {t("copyAddress")}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
