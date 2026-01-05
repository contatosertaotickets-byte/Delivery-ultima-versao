import type React from "react"
import type { Metadata, Viewport } from "next"

import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeColorProvider } from "@/components/theme-color-provider"
import { restaurantConfig } from "@/lib/config"
import "./globals.css"

import {
  Inter,
  Inter as V0_Font_Inter,
  Geist_Mono as V0_Font_Geist_Mono,
  Source_Serif_4 as V0_Font_Source_Serif_4,
} from "next/font/google"

// Initialize fonts
const _inter = V0_Font_Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})
const _geistMono = V0_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})
const _sourceSerif_4 = V0_Font_Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: `${restaurantConfig.name} | Delivery`,
  description: `Peça online no ${restaurantConfig.name}. Delivery rápido e prático via WhatsApp.`,
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#DC2626",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <CartProvider>
            <ThemeColorProvider>{children}</ThemeColorProvider>
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
