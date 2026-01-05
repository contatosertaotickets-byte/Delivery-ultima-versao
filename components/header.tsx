"use client"

import Link from "next/link"
import { ShoppingCart, Menu, X, Settings, ImageIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { getStoreSettings } from "@/lib/store"
import type { StoreSettings, LogoSize } from "@/lib/types"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { itemCount } = useCart()
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: "Sabor da Casa",
    logo: null,
    logoSize: "medium",
  })

  useEffect(() => {
    const settings = getStoreSettings()
    setStoreSettings(settings)
  }, [])

  const logoSizeClasses: Record<LogoSize, string> = {
    small: "h-8 w-8",
    medium: "h-10 w-10",
    large: "h-14 w-14",
  }

  const textSizeClasses: Record<LogoSize, string> = {
    small: "text-base",
    medium: "text-lg",
    large: "text-xl",
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02] active:scale-95"
          >
            {storeSettings.logo ? (
              <img
                src={storeSettings.logo || "/placeholder.svg"}
                alt={storeSettings.name}
                className={`${logoSizeClasses[storeSettings.logoSize]} rounded-lg object-contain transition-transform duration-200`}
              />
            ) : (
              <div
                className={`${logoSizeClasses[storeSettings.logoSize]} bg-red-100 rounded-lg flex items-center justify-center transition-colors duration-200`}
              >
                <ImageIcon className="h-1/2 w-1/2 text-red-600" />
              </div>
            )}
            <span className={`font-semibold text-foreground ${textSizeClasses[storeSettings.logoSize]}`}>
              {storeSettings.name}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
            >
              Início
            </Link>
            <Link
              href="/#cardapio"
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
            >
              Cardápio
            </Link>
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/carrinho">
              <Button variant="outline" size="icon" className="relative bg-transparent btn-animate">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium bounce-in">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden btn-animate"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="transition-transform duration-200">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </span>
            </Button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            mobileMenuOpen ? "max-h-48 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
          }`}
        >
          <nav className="flex flex-col gap-4 border-t border-border pt-4">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-all duration-200 touch-feedback py-2 px-3 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              href="/#cardapio"
              className="text-muted-foreground hover:text-foreground transition-all duration-200 touch-feedback py-2 px-3 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cardápio
            </Link>
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground transition-all duration-200 touch-feedback py-2 px-3 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Painel Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
