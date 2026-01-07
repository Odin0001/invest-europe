"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Shield, Users, Coins, CheckCircle, LineChart } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import logo from "@/public/logo.png"
import Image from "next/image"

export default function LandingPage() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">InvestPro</span>
          </div> */}
          <Link href="/"><Image src={logo.src} alt="InvestPro Logo" width={60} height={50} className="" /></Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              {t("features")}
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              {t("howItWorks")}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/auth/login">{t("login")}</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">{t("getStarted")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              <span className="text-slate-700">{t("trustedByInvestors")}</span>
            </div>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
              {t("heroTitle")}
            </h1>
            <p className="mb-8 text-balance text-lg text-slate-600 md:text-xl">{t("heroDescription")}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="text-base">
                <Link href="/auth/sign-up">
                  {t("startInvesting")} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                <Link href="#how-it-works">{t("learnMore")}</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-6 md:gap-12">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-slate-900 md:text-4xl">{t("upTo3Percent")}</div>
                <div className="text-sm text-slate-600 md:text-base">{t("dailyReturns")}</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-slate-900 md:text-4xl">24/7</div>
                <div className="text-sm text-slate-600 md:text-base">{t("support247")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              {t("whyChoose")}
            </h2>
            <p className="text-balance text-lg text-slate-600">{t("platformDescription")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{t("dailyReturns")}</h3>
                <p className="text-slate-600">{t("dailyReturnsDesc")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{t("securePlatform")}</h3>
                <p className="text-slate-600">{t("securePlatformDesc")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{t("support247")}</h3>
                <p className="text-slate-600">{t("support247Desc")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <Coins className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{t("flexibleWithdrawals")}</h3>
                <p className="text-slate-600">{t("flexibleWithdrawalsDesc")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100">
                  <LineChart className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{t("realTimeTracking")}</h3>
                <p className="text-slate-600">{t("realTimeTrackingDesc")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100">
                  <CheckCircle className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">{t("multipleCrypto")}</h3>
                <p className="text-slate-600">{t("multipleCryptoDesc")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-50 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              {t("howItWorks")}
            </h2>
            <p className="text-balance text-lg text-slate-600">{t("howItWorksDesc")}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">{t("createAccount")}</h3>
              <p className="text-slate-600">{t("step1Desc")}</p>
            </div>
            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">{t("step2Title")}</h3>
              <p className="text-slate-600">{t("step2Desc")}</p>
            </div>
            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">{t("step3Title")}</h3>
              <p className="text-slate-600">{t("step3Desc")}</p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="bg-slate-900 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              {t("readyToEarn")}
            </h2>
            <p className="mb-8 text-balance text-lg text-slate-300">{t("readyToEarnDesc")}</p>
            <Button size="lg" variant="secondary" asChild className="text-base">
              <Link href="/auth/sign-up">
                {t("createFreeAccount")} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Link href="/"><Image src={logo.src} alt="InvestPro Logo" width={100} height={50} className="" /></Link>
              </div>
              <p className="text-sm text-slate-600 max-w-sm">{t("buildingWealth")}</p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-slate-900">{t("platform")}</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="#features" className="hover:text-slate-900">
                    {t("features")}
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-slate-900">
                    {t("howItWorks")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-slate-900">{t("account")}</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/auth/login" className="hover:text-slate-900">
                    {t("login")}
                  </Link>
                </li>
                <li>
                  <Link href="/auth/sign-up" className="hover:text-slate-900">
                    {t("signUp")}
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-slate-900">
                    {t("dashboard")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-slate-600">
            <p>
              &copy; {new Date().getFullYear()} Invest Europe {t("allRightsReserved")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
