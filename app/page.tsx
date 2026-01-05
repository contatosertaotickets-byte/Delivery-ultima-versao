import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { MenuSection } from "@/components/menu-section"
import { FloatingCart } from "@/components/floating-cart"
import { Footer } from "@/components/footer"
import { StoreStatus } from "@/components/store-status"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <div className="container mx-auto px-4">
          <StoreStatus />
        </div>
        <MenuSection />
      </main>
      <FloatingCart />
      <Footer />
    </div>
  )
}
