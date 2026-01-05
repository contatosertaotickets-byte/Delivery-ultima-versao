"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStoreSettings } from "@/lib/store"
import type { StoreSettings } from "@/lib/types"
import { LogOut, ShoppingBag, Package, Settings, ImageIcon } from "lucide-react"
import { OrdersPanel } from "./orders-panel"
import { ProductsPanel } from "./products-panel"
import { SettingsPanel } from "./settings-panel"

export function AdminDashboard() {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState("orders")
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    setStoreSettings(getStoreSettings())

    // Listen for settings changes
    const handleSettingsChange = () => {
      setStoreSettings(getStoreSettings())
    }
    window.addEventListener("storeSettingsChange", handleSettingsChange)
    return () => window.removeEventListener("storeSettingsChange", handleSettingsChange)
  }, [])

  const storeName = storeSettings?.name || "Painel Admin"
  const storeLogo = storeSettings?.logo

  return (
    <div className="min-h-screen bg-muted/30 fade-in">
      <header className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {storeLogo ? (
                <img
                  src={storeLogo || "/placeholder.svg"}
                  alt={storeName}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ImageIcon className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="font-semibold text-foreground text-sm sm:text-base truncate">Painel Admin</h1>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">{storeName}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} size="sm" className="btn-animate shrink-0 bg-transparent">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger
              value="orders"
              className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm transition-all duration-200"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden xs:inline sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm transition-all duration-200"
            >
              <Package className="h-4 w-4" />
              <span className="hidden xs:inline sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 text-xs sm:text-sm transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden xs:inline sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4 sm:mt-6 slide-up">
            <OrdersPanel />
          </TabsContent>

          <TabsContent value="products" className="mt-4 sm:mt-6 slide-up">
            <ProductsPanel />
          </TabsContent>

          <TabsContent value="settings" className="mt-4 sm:mt-6 slide-up">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
