"use client"

import { useEffect, useState } from "react"
import { getStoreSettings, isStoreOpen } from "@/lib/store"
import { Clock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function StoreStatus() {
  const [open, setOpen] = useState(true)
  const [settings, setSettings] = useState(getStoreSettings())

  useEffect(() => {
    const checkStatus = () => {
      const currentSettings = getStoreSettings()
      setSettings(currentSettings)
      setOpen(isStoreOpen(currentSettings))
    }

    checkStatus()
    // Verificar a cada minuto
    const interval = setInterval(checkStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  if (open || !settings.businessHours) return null

  const now = new Date()
  const day = now.getDay()

  let dayLabel: string
  let hours: { open: string; close: string }

  if (day === 0) {
    // Domingo
    dayLabel = "domingo"
    hours = settings.businessHours.sunday
  } else if (day === 6) {
    // Sábado
    dayLabel = "sábado"
    hours = settings.businessHours.saturday
  } else {
    // Segunda a Sexta
    dayLabel = "dias de semana"
    hours = settings.businessHours.weekday
  }

  return (
    <Alert className="mb-4 sm:mb-6 border-yellow-400 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-1 text-sm sm:text-base">Estabelecimento fechado no momento</p>
            <p className="text-xs sm:text-sm">
              Nosso horário de funcionamento ({dayLabel}): {hours.open} às{" "}
              {hours.close === "00:00" ? "meia-noite" : hours.close}
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
