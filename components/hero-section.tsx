"use client"

import { Button } from "@/components/ui/button"
import { restaurantConfig } from "@/lib/config"
import { MessageCircle } from "lucide-react"

export function HeroSection() {
  const whatsappLink = `https://wa.me/${restaurantConfig.whatsapp}`

  return (
    <section className="relative bg-gradient-to-br from-red-600 to-red-700 text-white overflow-hidden fade-in">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="max-w-2xl slide-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
            O melhor sabor da cidade, na sua casa
          </h1>
          <p className="mt-4 md:mt-6 text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
            Peça agora pelo nosso site e receba seu pedido quentinho. Delivery rápido e atendimento via WhatsApp.
          </p>
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              size="lg"
              className="bg-white text-red-600 hover:bg-white/90 font-semibold btn-animate w-full sm:w-auto"
              asChild
            >
              <a href="#cardapio">Pedir Agora</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-semibold bg-transparent btn-animate w-full sm:w-auto"
              asChild
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                Chamar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 w-1/2 h-full hidden lg:block">
        <img
          src="/delicious-food-platter-restaurant.jpg"
          alt="Pratos deliciosos"
          className="absolute right-0 bottom-0 w-full h-full object-cover opacity-30 transition-transform duration-700 hover:scale-105"
        />
      </div>
    </section>
  )
}
