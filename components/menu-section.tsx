"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { categories } from "@/lib/config"
import { getProducts, getStoreSettings } from "@/lib/store"
import type { Product } from "@/lib/types"

export function MenuSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("Todos")
  const [mounted, setMounted] = useState(false)
  const [mobileProductsPerRow, setMobileProductsPerRow] = useState<1 | 2>(1)

  useEffect(() => {
    setProducts(getProducts())
    const settings = getStoreSettings()
    setMobileProductsPerRow(settings?.mobileProductsPerRow || 1)
    setMounted(true)
  }, [])

  const filteredProducts = activeCategory === "Todos" ? products : products.filter((p) => p.category === activeCategory)

  if (!mounted) {
    return (
      <section id="cardapio" className="py-8 sm:py-12 md:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Nosso Cardápio</h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </section>
    )
  }

  const gridClasses =
    mobileProductsPerRow === 2
      ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
      : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"

  return (
    <section id="cardapio" className="py-8 sm:py-12 md:py-16 bg-muted/30 fade-in">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center slide-up">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Nosso Cardápio</h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Escolha seus pratos favoritos e peça agora mesmo
          </p>
        </div>

        <div className="mt-4 sm:mt-6 md:mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center">
          <Button
            variant={activeCategory === "Todos" ? "default" : "outline"}
            onClick={() => setActiveCategory("Todos")}
            size="sm"
            className={`shrink-0 btn-animate text-xs sm:text-sm ${activeCategory === "Todos" ? "bg-primary hover:bg-primary/90" : "bg-transparent"}`}
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              size="sm"
              className={`shrink-0 btn-animate text-xs sm:text-sm ${activeCategory === category ? "bg-primary hover:bg-primary/90" : "bg-transparent"}`}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className={`mt-6 sm:mt-8 md:mt-10 ${gridClasses} stagger-children`}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} compact={mobileProductsPerRow === 2} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-center text-muted-foreground mt-8 sm:mt-10 fade-in text-sm sm:text-base">
            Nenhum produto encontrado nesta categoria.
          </p>
        )}
      </div>
    </section>
  )
}
