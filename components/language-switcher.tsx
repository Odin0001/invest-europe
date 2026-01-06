"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en"
    setLanguage(newLang)
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2">
      <Globe className="h-4 w-4" />
      {language === "en" ? "العربية" : "English"}
    </Button>
  )
}
