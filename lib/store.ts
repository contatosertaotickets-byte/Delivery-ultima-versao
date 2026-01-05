import type { Product, CartItem, Order, DeliverySettings, StoreSettings, PixPaymentStatus } from "./types"
import { sampleProducts } from "./sample-data"

const PRODUCTS_KEY = "restaurant_products"
const ORDERS_KEY = "restaurant_orders"
const CART_KEY = "restaurant_cart"
const DELIVERY_SETTINGS_KEY = "restaurant_delivery_settings"
const STORE_SETTINGS_KEY = "restaurant_store_settings"

const defaultDeliverySettings: DeliverySettings = {
  deliveryFee: 5.0,
  minimumOrder: 25.0,
  pixKey: "pix@restaurante.com",
  freeDeliveryThreshold: null,
  pix: {
    enabled: true,
    key: "pix@restaurante.com",
    holder: "Restaurante Exemplo",
    bank: "Banco Exemplo",
    qrCodeImage: null,
  },
}

const defaultStoreSettings: StoreSettings = {
  name: "Sabor da Casa",
  logo: null,
  logoSize: "medium",
  whatsappPedidos: "5511999999999",
  footer: {
    slogan: "O melhor sabor da cidade, agora com delivery direto na sua casa.",
    whatsapp: "(11) 99999-9999",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 123 - Centro",
    weekdayHours: "Segunda a Sexta: 11h - 23h",
    saturdayHours: "Sábado: 11h - 00h",
    sundayHours: "Domingo: 12h - 22h",
    showLogo: true,
  },
  businessHours: {
    weekday: {
      open: "11:00",
      close: "23:00",
    },
    saturday: {
      open: "11:00",
      close: "00:00",
    },
    sunday: {
      open: "12:00",
      close: "22:00",
    },
  },
  mobileProductsPerRow: 1,
  themeColor: "red",
}

export function getProducts(): Product[] {
  if (typeof window === "undefined") return sampleProducts
  const stored = localStorage.getItem(PRODUCTS_KEY)
  if (!stored) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(sampleProducts))
    return sampleProducts
  }
  return JSON.parse(stored)
}

export function saveProducts(products: Product[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(ORDERS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveOrder(order: Order): void {
  if (typeof window === "undefined") return
  const orders = getOrders()
  orders.unshift(order)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export function updateOrderStatus(orderId: string, status: Order["status"]): void {
  if (typeof window === "undefined") return
  const orders = getOrders()
  const index = orders.findIndex((o) => o.id === orderId)
  if (index !== -1) {
    orders[index].status = status
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  }
}

export function updatePixStatus(orderId: string, pixStatus: PixPaymentStatus): void {
  if (typeof window === "undefined") return
  const orders = getOrders()
  const index = orders.findIndex((o) => o.id === orderId)
  if (index !== -1) {
    orders[index].pixStatus = pixStatus
    // If confirmed, also update order status to em_preparo
    if (pixStatus === "confirmado") {
      orders[index].status = "em_preparo"
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  }
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(CART_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function clearCart(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(CART_KEY)
}

export function getDeliverySettings(): DeliverySettings {
  if (typeof window === "undefined") return defaultDeliverySettings
  const stored = localStorage.getItem(DELIVERY_SETTINGS_KEY)
  if (!stored) {
    localStorage.setItem(DELIVERY_SETTINGS_KEY, JSON.stringify(defaultDeliverySettings))
    return defaultDeliverySettings
  }
  const parsed = JSON.parse(stored)
  return { ...defaultDeliverySettings, ...parsed, pix: { ...defaultDeliverySettings.pix, ...parsed.pix } }
}

export function saveDeliverySettings(settings: DeliverySettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DELIVERY_SETTINGS_KEY, JSON.stringify(settings))
}

export function getStoreSettings(): StoreSettings {
  if (typeof window === "undefined") return defaultStoreSettings
  const stored = localStorage.getItem(STORE_SETTINGS_KEY)
  if (!stored) {
    localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(defaultStoreSettings))
    return defaultStoreSettings
  }
  const parsed = JSON.parse(stored)

  const migratedFooter = {
    ...defaultStoreSettings.footer,
    ...parsed.footer,
    saturdayHours:
      parsed.footer?.saturdayHours || parsed.footer?.weekendHours || defaultStoreSettings.footer.saturdayHours,
    sundayHours: parsed.footer?.sundayHours || parsed.footer?.weekendHours || defaultStoreSettings.footer.sundayHours,
  }

  const migratedBusinessHours = parsed.businessHours
    ? {
        weekday: { ...defaultStoreSettings.businessHours?.weekday, ...parsed.businessHours.weekday },
        saturday:
          parsed.businessHours.saturday || parsed.businessHours.weekend || defaultStoreSettings.businessHours?.saturday,
        sunday:
          parsed.businessHours.sunday || parsed.businessHours.weekend || defaultStoreSettings.businessHours?.sunday,
      }
    : defaultStoreSettings.businessHours

  return {
    ...defaultStoreSettings,
    ...parsed,
    footer: migratedFooter,
    businessHours: migratedBusinessHours,
    mobileProductsPerRow: parsed.mobileProductsPerRow || defaultStoreSettings.mobileProductsPerRow,
    themeColor: parsed.themeColor || defaultStoreSettings.themeColor,
  }
}

export function saveStoreSettings(settings: StoreSettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(settings))
}

export function isStoreOpen(settings?: StoreSettings): boolean {
  const storeSettings = settings || getStoreSettings()
  if (!storeSettings.businessHours) return true

  const now = new Date()
  const currentDay = now.getDay() // 0 = Domingo, 6 = Sábado
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  let hours
  if (currentDay === 0) {
    // Domingo
    hours = storeSettings.businessHours.sunday
  } else if (currentDay === 6) {
    // Sábado
    hours = storeSettings.businessHours.saturday
  } else {
    // Segunda a Sexta
    hours = storeSettings.businessHours.weekday
  }

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  const currentMinutes = timeToMinutes(currentTime)
  const openMinutes = timeToMinutes(hours.open)
  const closeMinutes = timeToMinutes(hours.close)

  if (closeMinutes === 0 || closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes
  }

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes
}
