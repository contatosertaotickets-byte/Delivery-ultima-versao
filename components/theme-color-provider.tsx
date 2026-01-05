"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getStoreSettings } from "@/lib/store"
import type { ThemeColor } from "@/lib/types"

const themeColors: Record<ThemeColor, { primary: string; accent: string; ring: string }> = {
  red: { primary: "#dc2626", accent: "#fef2f2", ring: "#dc2626" },
  purple: { primary: "#9333ea", accent: "#faf5ff", ring: "#9333ea" },
  blue: { primary: "#2563eb", accent: "#eff6ff", ring: "#2563eb" },
  green: { primary: "#16a34a", accent: "#f0fdf4", ring: "#16a34a" },
  orange: { primary: "#ea580c", accent: "#fff7ed", ring: "#ea580c" },
  pink: { primary: "#db2777", accent: "#fdf2f8", ring: "#db2777" },
  teal: { primary: "#0d9488", accent: "#f0fdfa", ring: "#0d9488" },
  indigo: { primary: "#4f46e5", accent: "#eef2ff", ring: "#4f46e5" },
}

interface ThemeColorContextType {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

const ThemeColorContext = createContext<ThemeColorContextType>({
  themeColor: "red",
  setThemeColor: () => {},
})

export function useThemeColor() {
  return useContext(ThemeColorContext)
}

export function ThemeColorProvider({ children }: { children: ReactNode }) {
  const [themeColor, setThemeColor] = useState<ThemeColor>("red")

  useEffect(() => {
    const settings = getStoreSettings()
    if (settings.themeColor) {
      setThemeColor(settings.themeColor)
      applyThemeColor(settings.themeColor)
    }

    // Listen for storage changes
    const handleStorageChange = () => {
      const settings = getStoreSettings()
      if (settings.themeColor) {
        setThemeColor(settings.themeColor)
        applyThemeColor(settings.themeColor)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for same-tab updates
    window.addEventListener("themeColorChange", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("themeColorChange", handleStorageChange)
    }
  }, [])

  const applyThemeColor = (color: ThemeColor) => {
    const colors = themeColors[color]
    document.documentElement.style.setProperty("--primary", colors.primary)
    document.documentElement.style.setProperty("--accent", colors.accent)
    document.documentElement.style.setProperty("--ring", colors.ring)
  }

  const handleSetThemeColor = (color: ThemeColor) => {
    setThemeColor(color)
    applyThemeColor(color)
  }

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor: handleSetThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  )
}
