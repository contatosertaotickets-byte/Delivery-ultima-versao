"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getOrders, updateOrderStatus, updatePixStatus } from "@/lib/store"
import type { Order } from "@/lib/types"
import {
  Clock,
  User,
  MapPin,
  Phone,
  RefreshCw,
  Truck,
  Store,
  CreditCard,
  Banknote,
  QrCode,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
} from "lucide-react"

const statusColors = {
  novo: "bg-blue-100 text-blue-800",
  em_preparo: "bg-yellow-100 text-yellow-800",
  entregue: "bg-green-100 text-green-800",
}

const statusLabels = {
  novo: "Novo",
  em_preparo: "Em Preparo",
  entregue: "Entregue",
}

const pixStatusColors = {
  aguardando: "bg-amber-100 text-amber-800",
  confirmado: "bg-green-100 text-green-800",
  recusado: "bg-red-100 text-red-800",
}

const pixStatusLabels = {
  aguardando: "Aguardando Confirmação",
  confirmado: "Pago",
  recusado: "Recusado",
}

const paymentIcons = {
  pix: QrCode,
  cartao: CreditCard,
  dinheiro: Banknote,
}

const paymentLabels = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [mounted, setMounted] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)

  const loadOrders = () => {
    setOrders(getOrders())
  }

  useEffect(() => {
    loadOrders()
    setMounted(true)
  }, [])

  const handleStatusChange = (orderId: string, status: Order["status"]) => {
    updateOrderStatus(orderId, status)
    loadOrders()
  }

  const handleConfirmPix = (orderId: string) => {
    updatePixStatus(orderId, "confirmado")
    loadOrders()
  }

  const handleRejectPix = (orderId: string) => {
    updatePixStatus(orderId, "recusado")
    loadOrders()
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!mounted) {
    return <p className="text-muted-foreground">Carregando pedidos...</p>
  }

  if (orders.length === 0) {
    return (
      <Card className="fade-in">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhum pedido recebido ainda.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Pedidos ({orders.length})</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={loadOrders}
          className="btn-animate w-full sm:w-auto bg-transparent"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 stagger-children">
        {orders.map((order) => {
          const PaymentIcon = order.customer.paymentMethod ? paymentIcons[order.customer.paymentMethod] : Banknote
          const isDelivery = order.customer.deliveryType === "entrega"
          const isPix = order.customer.paymentMethod === "pix"
          const pixStatus = order.pixStatus || "aguardando"

          return (
            <Card key={order.id} className="card-animate overflow-hidden">
              <CardHeader className="pb-3 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle className="text-sm sm:text-base flex flex-wrap items-center gap-2">
                      <span className="font-mono">#{order.id.slice(-6)}</span>
                      <Badge className={`${statusColors[order.status]} transition-colors duration-200`}>
                        {statusLabels[order.status]}
                      </Badge>
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        {isDelivery ? <Truck className="h-3 w-3" /> : <Store className="h-3 w-3" />}
                        {isDelivery ? "Entrega" : "Retirada"}
                      </Badge>
                      {isPix && (
                        <Badge className={`${pixStatusColors[pixStatus]} text-xs`}>{pixStatusLabels[pixStatus]}</Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Select
                    value={order.status}
                    onValueChange={(value: Order["status"]) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-full sm:w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="em_preparo">Em Preparo</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-3 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente
                    </h4>
                    <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.customer.whatsapp}
                    </p>
                  </div>
                  {isDelivery && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Endereço
                      </h4>
                      <p className="text-sm text-muted-foreground break-words">{order.customer.address}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                      <PaymentIcon className="h-4 w-4" />
                      Pagamento
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {order.customer.paymentMethod ? paymentLabels[order.customer.paymentMethod] : "Não informado"}
                    </p>
                    {order.customer.paymentMethod === "dinheiro" && order.customer.changeFor && (
                      <p className="text-sm text-amber-600 font-medium">
                        Troco para: {formatPrice(order.customer.changeFor)}
                        <br />
                        <span className="text-xs">(Levar: {formatPrice(order.customer.changeFor - order.total)})</span>
                      </p>
                    )}
                  </div>
                </div>

                {isPix && order.customer.pixReceipt && (
                  <div className="border border-border rounded-lg p-3 sm:p-4 bg-muted/30 slide-up">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Comprovante PIX
                      </h4>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReceipt(order.customer.pixReceipt || null)}
                            className="btn-animate w-full sm:w-auto"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Visualizar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-sm sm:text-base">
                              Comprovante PIX - Pedido #{order.id.slice(-6)}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            {order.customer.pixReceipt?.startsWith("data:application/pdf") ? (
                              <div className="text-center p-6 sm:p-8 bg-muted rounded-lg">
                                <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">Arquivo PDF</p>
                                <a
                                  href={order.customer.pixReceipt}
                                  download={`comprovante-${order.id}.pdf`}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 btn-animate"
                                >
                                  Baixar PDF
                                </a>
                              </div>
                            ) : (
                              <img
                                src={order.customer.pixReceipt || "/placeholder.svg"}
                                alt="Comprovante PIX"
                                className="w-full max-h-[60vh] object-contain rounded-lg"
                              />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {pixStatus === "aguardando" && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 btn-animate w-full sm:w-auto"
                          onClick={() => handleConfirmPix(order.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmar Pagamento
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectPix(order.id)}
                          className="btn-animate w-full sm:w-auto"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    )}

                    {pixStatus === "confirmado" && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Pagamento confirmado
                      </p>
                    )}

                    {pixStatus === "recusado" && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Pagamento recusado
                      </p>
                    )}
                  </div>
                )}

                {isPix && !order.customer.pixReceipt && pixStatus === "aguardando" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Comprovante não anexado pelo cliente.</span>
                    </p>
                  </div>
                )}

                {order.customer.notes && (
                  <p className="text-sm text-muted-foreground italic bg-muted/50 p-2 rounded break-words">
                    Obs: {order.customer.notes}
                  </p>
                )}

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-sm text-foreground mb-2">Itens</h4>
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li key={item.product.id} className="text-sm text-muted-foreground flex justify-between gap-2">
                        <span className="truncate">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(order.subtotal || order.total)}</span>
                    </div>
                    {isDelivery && order.deliveryFee !== undefined && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Taxa de entrega</span>
                        <span>{order.deliveryFee === 0 ? "GRÁTIS" : formatPrice(order.deliveryFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-1">
                      <span>Total</span>
                      <span className="text-red-600">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
