"use client"

import { useEffect, useState } from "react"
import { getStoreSettings } from "@/lib/store"
import type { StoreSettings } from "@/lib/types"
import { MessageCircle, Phone, MapPin } from "lucide-react"

export function Footer() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  useEffect(() => {
    setSettings(getStoreSettings())
  }, [])

  const name = settings?.name || "Sabor da Casa"
  const logo = settings?.logo
  const showLogo = settings?.footer?.showLogo ?? true
  const footer = settings?.footer || {
    slogan: "O melhor sabor da cidade, agora com delivery direto na sua casa.",
    whatsapp: "(11) 99999-9999",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 123 - Centro",
    weekdayHours: "Segunda a Sexta: 11h - 23h",
    saturdayHours: "Sábado: 11h - 00h",
    sundayHours: "Domingo: 12h - 22h",
    showLogo: true,
  }

  const whatsappNumber = footer.whatsapp.replace(/\D/g, "")
  const whatsappLink = whatsappNumber.startsWith("55") ? whatsappNumber : `55${whatsappNumber}`

  return (
    <footer className="bg-foreground text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showLogo && logo && (
          <div className="flex justify-center mb-6 sm:mb-8">
            <img src={logo || "/placeholder.svg"} alt={`${name} logo`} className="h-12 sm:h-16 w-auto object-contain" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base sm:text-lg">{name}</h3>
            <p className="mt-2 text-white/70 text-sm sm:text-base">{footer.slogan}</p>
          </div>
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contato</h4>
            <ul className="space-y-2 sm:space-y-3 text-white/70 text-sm">
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <MessageCircle className="h-4 w-4 shrink-0" />
                <a
                  href={`https://wa.me/${whatsappLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: {footer.whatsapp}
                </a>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{footer.phone}</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="text-center sm:text-left">{footer.address}</span>
              </li>
            </ul>
          </div>
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Horário de Funcionamento</h4>
            <ul className="space-y-1 sm:space-y-2 text-white/70 text-sm">
              <li>{footer.weekdayHours}</li>
              <li>{footer.saturdayHours || "Sábado: 11h - 00h"}</li>
              <li>{footer.sundayHours || "Domingo: 12h - 22h"}</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/20 text-center text-white/50 text-xs sm:text-sm">
          <p>
            &copy; {new Date().getFullYear()} {name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
