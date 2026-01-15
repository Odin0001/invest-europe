"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation, type Language } from "@/lib/i18n"

export default function SignUpPage() {
  const [lang, setLang] = useState<Language>("en")
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError(lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError(lang === "ar" ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin
      const redirectUrl = baseUrl.endsWith("/auth/login") ? baseUrl : `${baseUrl}/auth/login`

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : lang === "ar" ? "حدث خطأ" : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex justify-end">
            <LanguageSwitcher />
          </div>
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900">{t("signUp")}</h1>
            <p className="text-slate-600">{t("createAccount")}</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("signUp")}</CardTitle>
              <CardDescription>
                {lang === "ar" ? "املأ التفاصيل لإنشاء حساب" : "Fill in your details to create an account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">{t("fullName")}</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">{t("password")}</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (lang === "ar" ? "جاري إنشاء الحساب..." : "Creating account...") : t("createAccount")}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-slate-600">
                  {t("alreadyHaveAccount")}{" "}
                  <Link
                    href="/auth/login"
                    className="text-slate-900 font-medium underline underline-offset-4 hover:text-slate-700"
                  >
                    {t("login")}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
