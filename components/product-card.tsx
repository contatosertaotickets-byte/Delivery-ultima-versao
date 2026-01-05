"use client"

import { Plus, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  compact?: boolean
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <Card className="overflow-hidden group card-animate">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        {!product.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center fade-in">
            <span className="text-white font-semibold text-xs sm:text-sm md:text-lg">Indisponível</span>
          </div>
        )}
      </div>
      <CardContent className={compact ? "p-2 sm:p-3 md:p-4" : "p-3 sm:p-4"}>
        <h3
          className={`font-semibold text-foreground ${compact ? "text-xs sm:text-sm md:text-base line-clamp-1" : "text-sm sm:text-base md:text-lg"}`}
        >
          {product.name}
        </h3>
        <p
          className={`mt-0.5 sm:mt-1 text-muted-foreground ${compact ? "text-[10px] sm:text-xs line-clamp-1 md:line-clamp-2" : "text-xs sm:text-sm line-clamp-2"}`}
        >
          {product.description}
        </p>
        <div
          className={`flex items-center justify-between gap-1 sm:gap-2 ${compact ? "mt-2 sm:mt-3 flex-col sm:flex-row" : "mt-3 sm:mt-4"}`}
        >
          <span
            className={`font-bold text-primary ${compact ? "text-sm sm:text-base md:text-lg" : "text-base sm:text-lg md:text-xl"}`}
          >
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.available || added}
            className={`transition-all duration-300 ease-out transform active:scale-90 ${compact ? "w-full sm:w-auto text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3" : "text-xs sm:text-sm"} ${
              added ? "bg-green-600 hover:bg-green-600 scale-105" : "bg-primary hover:bg-primary/90 hover:scale-105"
            }`}
          >
            {added ? (
              <span className="flex items-center bounce-in">
                <Check className={compact ? "h-3 w-3 mr-0.5 sm:mr-1" : "h-3 w-3 sm:h-4 sm:w-4 mr-1"} />
                <span className={compact ? "hidden sm:inline" : ""}>Adicionado</span>
                <span className={compact ? "sm:hidden" : "hidden"}>OK</span>
              </span>
            ) : (
              <>
                <Plus className={compact ? "h-3 w-3 mr-0.5 sm:mr-1" : "h-3 w-3 sm:h-4 sm:w-4 mr-1"} />
                <span className={compact ? "hidden sm:inline" : ""}>Adicionar</span>
                <span className={compact ? "sm:hidden" : "hidden"}>Add</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
