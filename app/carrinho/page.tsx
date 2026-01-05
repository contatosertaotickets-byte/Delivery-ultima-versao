"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { saveOrder, getDeliverySettings, getStoreSettings, isStoreOpen } from "@/lib/store"
import { useCart } from "@/contexts/cart-context"
import { restaurantConfig } from "@/lib/config"
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Truck,
  Store,
  ShoppingBag,
  AlertCircle,
  Copy,
  Check,
  X,
  Upload,
  FileText,
  Clock,
} from "lucide-react"
import type { Order, OrderCustomer, DeliverySettings, PaymentMethod, DeliveryType, StoreSettings } from "@/lib/types"

const formatPrice = (price: number) => {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

const getPaymentLabel = (method: PaymentMethod) => {
  const labels: Record<PaymentMethod, string> = {
    pix: "PIX",
    cartao: "Cartão na entrega/retirada",
    dinheiro: "Dinheiro",
  }
  return labels[method]
}

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const [settings, setSettings] = useState<DeliverySettings | null>(null)
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null)
  const [storeOpen, setStoreOpen] = useState(true)
  const [customer, setCustomer] = useState<OrderCustomer>({
    name: "",
    whatsapp: "",
    address: "",
    notes: "",
    deliveryType: "entrega",
    paymentMethod: "pix",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pixKeyCopied, setPixKeyCopied] = useState(false)
  const [changeError, setChangeError] = useState<string | null>(null)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null)
  const receiptInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSettings(getDeliverySettings())
    const currentStoreSettings = getStoreSettings()
    setStoreSettings(currentStoreSettings)
    setStoreOpen(isStoreOpen(currentStoreSettings))
  }, [])

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  const isFreeDelivery =
    settings !== null && settings.freeDeliveryThreshold !== null && subtotal >= settings.freeDeliveryThreshold
  const deliveryFee = customer.deliveryType === "entrega" && !isFreeDelivery ? (settings?.deliveryFee ?? 0) : 0
  const total = subtotal + deliveryFee
  const isMinimumMet = total >= (settings?.minimumOrder ?? 0)

  const copyPixKey = async () => {
    const pixKey = settings?.pix?.key || ""
    if (pixKey) {
      await navigator.clipboard.writeText(pixKey)
      setPixKeyCopied(true)
      setTimeout(() => setPixKeyCopied(false), 2000)
    }
  }

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      setReceiptError("Formato inválido. Aceitos: JPG, PNG ou PDF")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setReceiptError("O arquivo deve ter no máximo 5MB")
      return
    }

    setReceiptError(null)
    setReceiptFileName(file.name)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setReceiptPreview(base64)
      setCustomer((prev) => ({ ...prev, pixReceipt: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const removeReceipt = () => {
    setReceiptPreview(null)
    setReceiptFileName(null)
    setCustomer((prev) => ({ ...prev, pixReceipt: undefined }))
    if (receiptInputRef.current) {
      receiptInputRef.current.value = ""
    }
  }

  const handleChangeForInput = (value: string) => {
    const numValue = Number.parseFloat(value.replace(",", "."))
    if (isNaN(numValue)) {
      setCustomer((prev) => ({ ...prev, changeFor: undefined }))
      setChangeError(null)
      return
    }

    setCustomer((prev) => ({ ...prev, changeFor: numValue }))

    if (numValue < total) {
      setChangeError(`O valor deve ser maior ou igual a ${formatPrice(total)}`)
    } else {
      setChangeError(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    if (!isMinimumMet) return

    if (!storeOpen) {
      alert("Não é possível fazer pedidos fora do horário de funcionamento.")
      return
    }

    if (customer.paymentMethod === "dinheiro" && customer.changeFor !== undefined && customer.changeFor < total) {
      setChangeError(`O valor deve ser maior ou igual a ${formatPrice(total)}`)
      return
    }

    if (customer.paymentMethod === "pix" && !customer.pixReceipt) {
      setReceiptError("É obrigatório anexar o comprovante PIX")
      return
    }

    setIsSubmitting(true)

    const order: Order = {
      id: Date.now().toString(),
      items: items,
      customer: customer,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total,
      status: "novo",
      pixStatus: customer.paymentMethod === "pix" ? "aguardando" : undefined,
      createdAt: new Date().toISOString(),
    }

    saveOrder(order)

    const itemsList = items
      .map((item) => `• ${item.quantity}x ${item.product.name} - ${formatPrice(item.product.price * item.quantity)}`)
      .join("\n")

    const deliveryLabel = customer.deliveryType === "entrega" ? "Entrega" : "Retirada no local"
    const paymentLabel = getPaymentLabel(customer.paymentMethod)

    let paymentInfo = `*Pagamento:* ${paymentLabel}`
    if (customer.paymentMethod === "dinheiro" && customer.changeFor) {
      const changeAmount = customer.changeFor - total
      paymentInfo += `\n*Troco para:* ${formatPrice(customer.changeFor)} (Troco: ${formatPrice(changeAmount)})`
    }
    if (customer.paymentMethod === "pix") {
      paymentInfo += `\n⚠️ *Comprovante anexado no sistema*`
      paymentInfo += `\n_O pedido será preparado após a confirmação do pagamento._`
    }

    const deliveryFeeText =
      customer.deliveryType === "entrega"
        ? isFreeDelivery
          ? `*Taxa de entrega:* GRÁTIS\n`
          : `*Taxa de entrega:* ${formatPrice(deliveryFee)}\n`
        : ""

    const storeName = storeSettings?.name || restaurantConfig.name
    const whatsappNumber = storeSettings?.whatsappPedidos || restaurantConfig.whatsapp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(itemsList + "\n\n" + deliveryLabel + "\n\n" + paymentInfo + "\n\n" + deliveryFeeText + "\n\n*Total:* " + formatPrice(total))}`

    clearCart()
    window.open(whatsappUrl, "_blank")
    router.push(`/pedido-confirmado?orderId=${order.id}`)
  }

  if (!settings || !storeSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
          <Button variant="ghost" asChild className="mb-4 sm:mb-6 -ml-2 hover:bg-transparent">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Voltar ao cardápio</span>
            </Link>
          </Button>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-8 text-balance">Meu Carrinho</h1>

          {items.length === 0 ? (
            <Card>
              <CardContent className="py-8 sm:py-12 text-center">
                <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-base sm:text-lg text-muted-foreground mb-4">Seu carrinho está vazio</p>
                <Button asChild>
                  <Link href="/">Ver Cardápio</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-3 space-y-3 sm:space-y-4">
                {!storeOpen && storeSettings.businessHours && (
                  <Card className="border-yellow-400 bg-yellow-50">
                    <CardContent className="py-3 sm:py-4 px-3 sm:px-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-yellow-800 mb-1 text-sm sm:text-base">
                            Estabelecimento fechado
                          </p>
                          <p className="text-xs sm:text-sm text-yellow-700">
                            Não é possível finalizar pedidos fora do horário de funcionamento.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {items.map((item) => (
                  <Card key={item.product.id}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                          <Image
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 sm:mb-1 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2">
                            {item.product.description}
                          </p>
                          <p className="text-base sm:text-lg font-bold text-primary">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.product.id)}
                            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>

                          <div className="flex items-center gap-1 bg-muted rounded-full p-0.5 sm:p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 rounded-full hover:bg-background"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 sm:w-8 text-center font-medium text-xs sm:text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 rounded-full hover:bg-background"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary and Form */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-20 space-y-4 sm:space-y-6">
                  {/* Order Summary */}
                  <Card>
                    <CardHeader className="px-3 sm:px-4 py-3 sm:py-4">
                      <CardTitle className="text-base sm:text-lg">Resumo do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                      </div>
                      {customer.deliveryType === "entrega" && (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Taxa de entrega</span>
                          <span className="font-medium">{isFreeDelivery ? "GRÁTIS" : formatPrice(deliveryFee)}</span>
                        </div>
                      )}
                      {isFreeDelivery && customer.deliveryType === "entrega" && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Você ganhou frete grátis!
                        </p>
                      )}
                      <div className="border-t pt-2 sm:pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm sm:text-base">Total</span>
                          <span className="text-lg sm:text-xl font-bold text-primary">{formatPrice(total)}</span>
                        </div>
                      </div>
                      {!isMinimumMet && (
                        <p className="text-xs sm:text-sm text-amber-600 flex items-start gap-1 pt-2">
                          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 shrink-0" />
                          <span>Pedido mínimo: {formatPrice(settings.minimumOrder)}</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Delivery Type Card */}
                    <Card>
                      <CardHeader className="px-3 sm:px-4 py-3 sm:py-4">
                        <CardTitle className="text-base sm:text-lg">Modalidade</CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                        <RadioGroup
                          value={customer.deliveryType}
                          onValueChange={(value: DeliveryType) =>
                            setCustomer((prev) => ({ ...prev, deliveryType: value }))
                          }
                          className="grid grid-cols-2 gap-2 sm:gap-3"
                        >
                          <Label
                            htmlFor="entrega"
                            className={`flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              customer.deliveryType === "entrega"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <RadioGroupItem value="entrega" id="entrega" className="sr-only" />
                            <Truck
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${customer.deliveryType === "entrega" ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <span
                              className={`font-medium text-xs sm:text-sm ${customer.deliveryType === "entrega" ? "text-primary" : "text-foreground"}`}
                            >
                              Entrega
                            </span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">
                              {isFreeDelivery ? "Grátis" : formatPrice(settings.deliveryFee)}
                            </span>
                          </Label>
                          <Label
                            htmlFor="retirada"
                            className={`flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              customer.deliveryType === "retirada"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <RadioGroupItem value="retirada" id="retirada" className="sr-only" />
                            <Store
                              className={`h-5 w-5 sm:h-6 sm:w-6 ${customer.deliveryType === "retirada" ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <span
                              className={`font-medium text-xs sm:text-sm ${customer.deliveryType === "retirada" ? "text-primary" : "text-foreground"}`}
                            >
                              Retirada
                            </span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">No local</span>
                          </Label>
                        </RadioGroup>
                      </CardContent>
                    </Card>

                    {/* Customer Info Card */}
                    <Card>
                      <CardHeader className="px-3 sm:px-4 py-3 sm:py-4">
                        <CardTitle className="text-base sm:text-lg">Seus Dados</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="space-y-1 sm:space-y-2">
                          <Label htmlFor="name" className="text-xs sm:text-sm">
                            Nome *
                          </Label>
                          <Input
                            id="name"
                            placeholder="Seu nome completo"
                            value={customer.name}
                            onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                            required
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-1 sm:space-y-2">
                          <Label htmlFor="whatsapp" className="text-xs sm:text-sm">
                            WhatsApp *
                          </Label>
                          <Input
                            id="whatsapp"
                            placeholder="(00) 00000-0000"
                            value={customer.whatsapp}
                            onChange={(e) => setCustomer((prev) => ({ ...prev, whatsapp: e.target.value }))}
                            required
                            className="text-sm"
                          />
                        </div>

                        {customer.deliveryType === "entrega" && (
                          <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="address" className="text-xs sm:text-sm">
                              Endereço completo *
                            </Label>
                            <Textarea
                              id="address"
                              placeholder="Rua, número, bairro, complemento..."
                              value={customer.address}
                              onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))}
                              required
                              rows={2}
                              className="text-sm resize-none"
                            />
                          </div>
                        )}

                        <div className="space-y-1 sm:space-y-2">
                          <Label htmlFor="notes" className="text-xs sm:text-sm">
                            Observações
                          </Label>
                          <Textarea
                            id="notes"
                            placeholder="Alguma observação para o pedido?"
                            value={customer.notes}
                            onChange={(e) => setCustomer((prev) => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                            className="text-sm resize-none"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Method Card */}
                    <Card>
                      <CardHeader className="px-3 sm:px-4 py-3 sm:py-4">
                        <CardTitle className="text-base sm:text-lg">Forma de Pagamento</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-4 pb-3 sm:pb-4">
                        <RadioGroup
                          value={customer.paymentMethod}
                          onValueChange={(value: PaymentMethod) =>
                            setCustomer((prev) => ({ ...prev, paymentMethod: value }))
                          }
                          className="space-y-2 sm:space-y-3"
                        >
                          {settings.pix.enabled && (
                            <Label
                              htmlFor="pix"
                              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                customer.paymentMethod === "pix"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-muted-foreground"
                              }`}
                            >
                              <RadioGroupItem value="pix" id="pix" />
                              <span className="font-medium text-sm">PIX</span>
                            </Label>
                          )}
                          <Label
                            htmlFor="cartao"
                            className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                              customer.paymentMethod === "cartao"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <RadioGroupItem value="cartao" id="cartao" />
                            <span className="font-medium text-sm">Cartão na entrega</span>
                          </Label>
                          <Label
                            htmlFor="dinheiro"
                            className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                              customer.paymentMethod === "dinheiro"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <RadioGroupItem value="dinheiro" id="dinheiro" />
                            <span className="font-medium text-sm">Dinheiro</span>
                          </Label>
                        </RadioGroup>

                        {/* Change input for cash payment */}
                        {customer.paymentMethod === "dinheiro" && (
                          <div className="space-y-1 sm:space-y-2 pt-2">
                            <Label htmlFor="changeFor" className="text-xs sm:text-sm">
                              Troco para (opcional)
                            </Label>
                            <Input
                              id="changeFor"
                              type="text"
                              placeholder="Ex: 50,00"
                              onChange={(e) => handleChangeForInput(e.target.value)}
                              className="text-sm"
                            />
                            {changeError && (
                              <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {changeError}
                              </p>
                            )}
                          </div>
                        )}

                        {/* PIX payment details */}
                        {customer.paymentMethod === "pix" && settings.pix.enabled && (
                          <div className="space-y-3 sm:space-y-4 pt-2 border-t">
                            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                              <p className="text-xs sm:text-sm font-medium">Dados para pagamento:</p>
                              <div className="space-y-1 text-xs sm:text-sm">
                                <p>
                                  <span className="text-muted-foreground">Chave:</span> {settings.pix.key}
                                </p>
                                <p>
                                  <span className="text-muted-foreground">Titular:</span> {settings.pix.holder}
                                </p>
                                <p>
                                  <span className="text-muted-foreground">Banco:</span> {settings.pix.bank}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copyPixKey}
                                className="w-full mt-2 bg-transparent"
                              >
                                {pixKeyCopied ? (
                                  <>
                                    <Check className="h-3 w-3 mr-2" />
                                    Copiado!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-2" />
                                    Copiar chave PIX
                                  </>
                                )}
                              </Button>
                            </div>

                            {settings.pix.qrCodeImage && (
                              <div className="flex justify-center">
                                <img
                                  src={settings.pix.qrCodeImage || "/placeholder.svg"}
                                  alt="QR Code PIX"
                                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-lg border bg-white p-2"
                                />
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">Comprovante PIX *</Label>
                              {receiptPreview ? (
                                <div className="relative border rounded-lg p-3 bg-muted/30">
                                  <div className="flex items-center gap-3">
                                    {receiptPreview.startsWith("data:image") ? (
                                      <img
                                        src={receiptPreview || "/placeholder.svg"}
                                        alt="Comprovante"
                                        className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="h-12 w-12 sm:h-16 sm:w-16 bg-muted rounded flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs sm:text-sm font-medium truncate">{receiptFileName}</p>
                                      <p className="text-xs text-green-600 flex items-center gap-1">
                                        <Check className="h-3 w-3" />
                                        Anexado
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={removeReceipt}
                                      className="h-8 w-8 shrink-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    ref={receiptInputRef}
                                    onChange={handleReceiptUpload}
                                    className="hidden"
                                    id="receipt-upload"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => receiptInputRef.current?.click()}
                                    className="w-full"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Anexar comprovante
                                  </Button>
                                  <p className="text-xs text-muted-foreground mt-1 text-center">
                                    JPG, PNG ou PDF. Máximo 5MB.
                                  </p>
                                </div>
                              )}
                              {receiptError && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {receiptError}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full btn-animate text-sm sm:text-base"
                      disabled={
                        isSubmitting ||
                        items.length === 0 ||
                        !isMinimumMet ||
                        !storeOpen ||
                        (customer.paymentMethod === "pix" && !customer.pixReceipt)
                      }
                    >
                      {isSubmitting ? "Enviando..." : "Finalizar Pedido via WhatsApp"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
