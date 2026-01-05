export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  available: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export type PaymentMethod = "pix" | "cartao" | "dinheiro"
export type DeliveryType = "entrega" | "retirada"
export type PixPaymentStatus = "aguardando" | "confirmado" | "recusado"

export interface OrderCustomer {
  name: string
  whatsapp: string
  address: string
  notes: string
  deliveryType: DeliveryType
  paymentMethod: PaymentMethod
  changeFor?: number
  pixReceipt?: string
}

export interface Order {
  id: string
  items: CartItem[]
  customer: OrderCustomer
  subtotal: number
  deliveryFee: number
  total: number
  status: "novo" | "em_preparo" | "entregue"
  pixStatus?: PixPaymentStatus
  createdAt: string
}

export interface RestaurantConfig {
  name: string
  logo: string
  whatsapp: string
  primaryColor: string
  secondaryColor: string
}

export interface PixSettings {
  enabled: boolean
  key: string
  holder: string
  bank: string
  qrCodeImage: string | null
}

export interface DeliverySettings {
  deliveryFee: number
  minimumOrder: number
  pixKey: string
  freeDeliveryThreshold: number | null
  pix: PixSettings
}

export type LogoSize = "small" | "medium" | "large"

export type ThemeColor = "red" | "purple" | "blue" | "green" | "orange" | "pink" | "teal" | "indigo"

export interface FooterSettings {
  slogan: string
  whatsapp: string
  phone: string
  address: string
  weekdayHours: string
  saturdayHours: string // Separated saturday and sunday
  sundayHours: string // Separated saturday and sunday
  showLogo: boolean
}

export interface BusinessHours {
  weekday: {
    open: string
    close: string
  }
  saturday: {
    open: string
    close: string
  }
  sunday: {
    open: string
    close: string
  }
}

export interface StoreSettings {
  name: string
  logo: string | null
  logoSize: LogoSize
  whatsappPedidos: string
  footer: FooterSettings
  businessHours?: BusinessHours
  mobileProductsPerRow: 1 | 2
  themeColor: ThemeColor // Added theme color
}

export interface AdminUser {
  id: string
  cpf_cnpj: string
  name: string
  created_at: string
}
