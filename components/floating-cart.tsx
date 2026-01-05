"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"

export function FloatingCart() {
  const { itemCount, total } = useCart()

  if (itemCount === 0) return null

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-auto z-50">
      <Link href="/carrinho">
        <Button
          size="lg"
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 shadow-2xl bounce-in btn-animate hover:shadow-red-600/25"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          <span className="font-semibold">
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </span>
          <span className="mx-2 opacity-60">|</span>
          <span className="font-bold">{formatPrice(total)}</span>
        </Button>
      </Link>
    </div>
  )
}
