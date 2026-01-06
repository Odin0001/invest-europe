import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { LanguageProvider } from "@/lib/i18n"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")

export const metadata: Metadata = {
  title: "Invest Europe",
  description: "Start Investing Today with Our User-Friendly Platform",
  viewport: "width=device-width, initial-scale=1",
  keywords: ["investment", "crypto", "investing", "finance", "wallet", "invest europe"],
  authors: [{ name: "Investment Team" }],
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  openGraph: {
    title: "Invest Europe",
    description: "Start Investing Today with Our User-Friendly Platform",
    siteName: "Invest Europe",
    images: [
      {
        url: "/icon.svg",
        alt: "Invest Europe",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invest Europe",
    description: "Start Investing Today with Our User-Friendly Platform",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "msapplication-TileColor": "#ffffff",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
