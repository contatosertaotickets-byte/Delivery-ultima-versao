"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getDeliverySettings, saveDeliverySettings, getStoreSettings, saveStoreSettings } from "@/lib/store"
import type { DeliverySettings, StoreSettings, LogoSize, ThemeColor } from "@/lib/types"
import {
  Check,
  Truck,
  QrCode,
  Gift,
  Store,
  Upload,
  X,
  ImageIcon,
  FileText,
  MessageCircle,
  Clock,
  Palette,
} from "lucide-react"

const themeColorOptions: { value: ThemeColor; label: string; color: string }[] = [
  { value: "red", label: "Vermelho", color: "#dc2626" },
  { value: "purple", label: "Roxo", color: "#9333ea" },
  { value: "blue", label: "Azul", color: "#2563eb" },
  { value: "green", label: "Verde", color: "#16a34a" },
  { value: "orange", label: "Laranja", color: "#ea580c" },
  { value: "pink", label: "Rosa", color: "#db2777" },
  { value: "teal", label: "Turquesa", color: "#0d9488" },
  { value: "indigo", label: "Índigo", color: "#4f46e5" },
]

export function SettingsPanel() {
  const [settings, setSettings] = useState<DeliverySettings>({
    deliveryFee: 5,
    minimumOrder: 25,
    pixKey: "",
    freeDeliveryThreshold: null,
    pix: {
      enabled: true,
      key: "",
      holder: "",
      bank: "",
      qrCodeImage: null,
    },
  })
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
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
  })
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrCodeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loaded = getDeliverySettings()
    setSettings(loaded)
    setFreeDeliveryEnabled(loaded.freeDeliveryThreshold !== null)
    const loadedStore = getStoreSettings()
    setStoreSettings(loadedStore)
  }, [])

  const handleFreeDeliveryToggle = (enabled: boolean) => {
    setFreeDeliveryEnabled(enabled)
    if (!enabled) {
      setSettings((prev) => ({ ...prev, freeDeliveryThreshold: null }))
    } else {
      setSettings((prev) => ({ ...prev, freeDeliveryThreshold: 50 }))
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setStoreSettings((prev) => ({ ...prev, logo: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setSettings((prev) => ({
        ...prev,
        pix: { ...prev.pix, qrCodeImage: base64 },
      }))
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setStoreSettings((prev) => ({ ...prev, logo: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeQrCode = () => {
    setSettings((prev) => ({
      ...prev,
      pix: { ...prev.pix, qrCodeImage: null },
    }))
    if (qrCodeInputRef.current) {
      qrCodeInputRef.current.value = ""
    }
  }

  const handleSave = () => {
    saveDeliverySettings(settings)
    saveStoreSettings(storeSettings)
    setSaved(true)

    // Dispatch events to update other components
    window.dispatchEvent(new Event("storeSettingsChange"))
    window.dispatchEvent(new Event("themeColorChange"))

    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Store Settings Card */}
      <Card className="card-animate">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Store className="h-5 w-5" />
            Configurações da Loja
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Personalize o nome, logo e aparência do seu estabelecimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="space-y-2">
            <Label htmlFor="storeName">Nome do Estabelecimento</Label>
            <Input
              id="storeName"
              type="text"
              value={storeSettings.name}
              onChange={(e) => setStoreSettings((prev) => ({ ...prev, name: e.target.value }))}
              className="input-focus"
              placeholder="Nome da sua loja"
            />
          </div>

          <div className="space-y-3">
            <Label>Logo do Estabelecimento</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {storeSettings.logo ? (
                <div className="relative">
                  <img
                    src={storeSettings.logo || "/placeholder.svg"}
                    alt="Logo"
                    className="h-20 w-20 object-contain rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {storeSettings.logo ? "Alterar Logo" : "Enviar Logo"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">PNG, JPG ou SVG. Máximo 2MB.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Tamanho do Logo</Label>
            <RadioGroup
              value={storeSettings.logoSize}
              onValueChange={(value: LogoSize) => setStoreSettings((prev) => ({ ...prev, logoSize: value }))}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="cursor-pointer">
                  Pequeno
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer">
                  Médio
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="cursor-pointer">
                  Grande
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Cor do Tema
            </Label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {themeColorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStoreSettings((prev) => ({ ...prev, themeColor: option.value }))}
                  className={`relative w-full aspect-square rounded-lg border-2 transition-all ${
                    storeSettings.themeColor === option.value
                      ? "border-foreground ring-2 ring-offset-2 ring-foreground"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: option.color }}
                  title={option.label}
                >
                  {storeSettings.themeColor === option.value && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Cor selecionada: {themeColorOptions.find((o) => o.value === storeSettings.themeColor)?.label}
            </p>
          </div>

          <div className="space-y-3">
            <Label>Layout de Produtos (Mobile)</Label>
            <RadioGroup
              value={String(storeSettings.mobileProductsPerRow)}
              onValueChange={(value) =>
                setStoreSettings((prev) => ({ ...prev, mobileProductsPerRow: Number(value) as 1 | 2 }))
              }
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="layout-1" />
                <Label htmlFor="layout-1" className="cursor-pointer">
                  1 coluna
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="layout-2" />
                <Label htmlFor="layout-2" className="cursor-pointer">
                  2 colunas
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">Define como os produtos serão exibidos no celular.</p>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Settings Card */}
      <Card className="card-animate">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageCircle className="h-5 w-5" />
            WhatsApp para Pedidos
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configure o número de WhatsApp para onde os pedidos serão enviados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="space-y-2">
            <Label htmlFor="whatsappPedidos">Número do WhatsApp</Label>
            <Input
              id="whatsappPedidos"
              type="text"
              placeholder="5511999999999"
              value={storeSettings.whatsappPedidos}
              onChange={(e) =>
                setStoreSettings((prev) => ({
                  ...prev,
                  whatsappPedidos: e.target.value.replace(/\D/g, ""),
                }))
              }
              className="input-focus"
            />
            <p className="text-xs text-muted-foreground">Formato: código do país + DDD + número (ex: 5511999999999)</p>
          </div>
          <div className="border rounded-lg p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-1">Os pedidos serão enviados para:</p>
            <p className="text-sm font-medium text-foreground">
              wa.me/{storeSettings.whatsappPedidos || "5511999999999"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="card-animate">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-5 w-5" />
            Horário de Funcionamento
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configure os horários em que o estabelecimento aceita pedidos. Fora desses horários, o site mostrará que
            está fechado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Weekdays */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Segunda a Sexta</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="weekdayOpen" className="text-xs text-muted-foreground">
                  Abertura
                </Label>
                <Input
                  id="weekdayOpen"
                  type="time"
                  value={storeSettings.businessHours?.weekday?.open || "11:00"}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      businessHours: {
                        ...prev.businessHours!,
                        weekday: {
                          ...prev.businessHours?.weekday!,
                          open: e.target.value,
                        },
                      },
                    }))
                  }
                  className="input-focus"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="weekdayClose" className="text-xs text-muted-foreground">
                  Fechamento
                </Label>
                <Input
                  id="weekdayClose"
                  type="time"
                  value={storeSettings.businessHours?.weekday?.close || "23:00"}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      businessHours: {
                        ...prev.businessHours!,
                        weekday: {
                          ...prev.businessHours?.weekday!,
                          close: e.target.value,
                        },
                      },
                    }))
                  }
                  className="input-focus"
                />
              </div>
            </div>
          </div>

          {/* Saturday */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sábado</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="saturdayOpen" className="text-xs text-muted-foreground">
                  Abertura
                </Label>
                <Input
                  id="saturdayOpen"
                  type="time"
                  value={storeSettings.businessHours?.saturday?.open || "11:00"}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      businessHours: {
                        ...prev.businessHours!,
                        saturday: {
                          ...prev.businessHours?.saturday!,
                          open: e.target.value,
                        },
                      },
                    }))
                  }
                  className="input-focus"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="saturdayClose" className="text-xs text-muted-foreground">
                  Fechamento
                </Label>
                <Input
                  id="saturdayClose"
                  type="time"
                  value={storeSettings.businessHours?.saturday?.close || "00:00"}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      businessHours: {
                        ...prev.businessHours!,
                        saturday: {
                          ...prev.businessHours?.saturday!,
                          close: e.target.value,
                        },
                      },
                    }))
                  }
                  className="input-focus"
                />
              </div>
            </div>
          </div>

          {/* Sunday */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Domingo</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sundayOpen" className="text-xs text-muted-foreground">
                  Abertura
                </Label>
                <Input
                  id="sundayOpen"
                  type="time"
                  value={storeSettings.businessHours?.sunday?.open || "12:00"}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      businessHours: {
                        ...prev.businessHours!,
                        sunday: {
                          ...prev.businessHours?.sunday!,
                          open: e.target.value,
                        },
                      },
                    }))
                  }
                  className="input-focus"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sundayClose" className="text-xs text-muted-foreground">
                  Fechamento
                </Label>
                <Input
                  id="sundayClose"
                  type="time"
                  value={storeSettings.businessHours?.sunday?.close || "22:00"}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({
                      ...prev,
                      businessHours: {
                        ...prev.businessHours!,
                        sunday: {
                          ...prev.businessHours?.sunday!,
                          close: e.target.value,
                        },
                      },
                    }))
                  }
                  className="input-focus"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-3 sm:p-4 bg-muted/30">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">Resumo dos horários:</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Segunda a Sexta:</span>
                <span className="font-medium text-foreground">
                  {storeSettings.businessHours?.weekday?.open || "11:00"} -{" "}
                  {storeSettings.businessHours?.weekday?.close || "23:00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Sábado:</span>
                <span className="font-medium text-foreground">
                  {storeSettings.businessHours?.saturday?.open || "11:00"} -{" "}
                  {storeSettings.businessHours?.saturday?.close || "00:00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Domingo:</span>
                <span className="font-medium text-foreground">
                  {storeSettings.businessHours?.sunday?.open || "12:00"} -{" "}
                  {storeSettings.businessHours?.sunday?.close || "22:00"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>Importante:</strong> Quando o estabelecimento estiver fechado, o site mostrará um aviso e
              bloqueará a finalização de pedidos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card className="card-animate">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Truck className="h-5 w-5" />
            Configurações de Entrega
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Configure taxa de entrega e pedido mínimo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
              <Input
                id="deliveryFee"
                type="number"
                min="0"
                step="0.01"
                value={settings.deliveryFee}
                onChange={(e) => setSettings((prev) => ({ ...prev, deliveryFee: Number(e.target.value) }))}
                className="input-focus"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumOrder">Pedido Mínimo (R$)</Label>
              <Input
                id="minimumOrder"
                type="number"
                min="0"
                step="0.01"
                value={settings.minimumOrder}
                onChange={(e) => setSettings((prev) => ({ ...prev, minimumOrder: Number(e.target.value) }))}
                className="input-focus"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Free Delivery */}
      <Card className="card-animate">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Gift className="h-5 w-5" />
            Frete Grátis
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Ofereça frete grátis para pedidos acima de um valor mínimo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ativar Frete Grátis</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Clientes terão frete grátis acima do valor configurado.
              </p>
            </div>
            <Switch checked={freeDeliveryEnabled} onCheckedChange={handleFreeDeliveryToggle} />
          </div>

          {freeDeliveryEnabled && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="freeDeliveryThreshold">Valor Mínimo para Frete Grátis (R$)</Label>
              <Input
                id="freeDeliveryThreshold"
                type="number"
                min="0"
                step="0.01"
                value={settings.freeDeliveryThreshold || 0}
                onChange={(e) => setSettings((prev) => ({ ...prev, freeDeliveryThreshold: Number(e.target.value) }))}
                className="input-focus"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* PIX Settings */}
      <Card className="card-animate">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <QrCode className="h-5 w-5" />
            Configurações do PIX
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configure os dados da sua chave PIX para receber pagamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aceitar Pagamento via PIX</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Clientes poderão pagar via PIX antes da entrega.
              </p>
            </div>
            <Switch
              checked={settings.pix.enabled}
              onCheckedChange={(enabled) =>
                setSettings((prev) => ({
                  ...prev,
                  pix: { ...prev.pix, enabled },
                }))
              }
            />
          </div>

          {settings.pix.enabled && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pixKey">Chave PIX</Label>
                  <Input
                    id="pixKey"
                    type="text"
                    placeholder="email@exemplo.com, CPF, CNPJ ou telefone"
                    value={settings.pix.key}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        pix: { ...prev.pix, key: e.target.value },
                      }))
                    }
                    className="input-focus"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pixHolder">Nome do Titular</Label>
                  <Input
                    id="pixHolder"
                    type="text"
                    placeholder="Nome completo ou razão social"
                    value={settings.pix.holder}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        pix: { ...prev.pix, holder: e.target.value },
                      }))
                    }
                    className="input-focus"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixBank">Banco</Label>
                <Input
                  id="pixBank"
                  type="text"
                  placeholder="Ex: Nubank, Banco do Brasil, etc."
                  value={settings.pix.bank}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      pix: { ...prev.pix, bank: e.target.value },
                    }))
                  }
                  className="input-focus"
                />
              </div>

              <div className="space-y-3">
                <Label>QR Code do PIX (opcional)</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {settings.pix.qrCodeImage ? (
                    <div className="relative">
                      <img
                        src={settings.pix.qrCodeImage || "/placeholder.svg"}
                        alt="QR Code PIX"
                        className="h-32 w-32 object-contain rounded-lg border border-border bg-white p-2"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeQrCode}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-32 w-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                      <QrCode className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 w-full sm:w-auto">
                    <input
                      type="file"
                      accept="image/*"
                      ref={qrCodeInputRef}
                      onChange={handleQrCodeUpload}
                      className="hidden"
                      id="qrcode-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => qrCodeInputRef.current?.click()}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {settings.pix.qrCodeImage ? "Alterar QR Code" : "Enviar QR Code"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Gere o QR Code no app do seu banco e faça upload da imagem.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Footer Settings */}
      <Card className="card-animate">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-5 w-5" />
            Configurações do Rodapé
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configure as informações que aparecem no rodapé do site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mostrar Logo no Rodapé</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Exibe o logo do estabelecimento no rodapé do site.
              </p>
            </div>
            <Switch
              checked={storeSettings.footer?.showLogo ?? true}
              onCheckedChange={(showLogo) =>
                setStoreSettings((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, showLogo },
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogan">Slogan</Label>
            <Input
              id="slogan"
              type="text"
              placeholder="O melhor sabor da cidade..."
              value={storeSettings.footer?.slogan || ""}
              onChange={(e) =>
                setStoreSettings((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, slogan: e.target.value },
                }))
              }
              className="input-focus"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="footerWhatsapp">WhatsApp (contato)</Label>
              <Input
                id="footerWhatsapp"
                type="text"
                placeholder="(11) 99999-9999"
                value={storeSettings.footer?.whatsapp || ""}
                onChange={(e) =>
                  setStoreSettings((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, whatsapp: e.target.value },
                  }))
                }
                className="input-focus"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerPhone">Telefone</Label>
              <Input
                id="footerPhone"
                type="text"
                placeholder="(11) 99999-9999"
                value={storeSettings.footer?.phone || ""}
                onChange={(e) =>
                  setStoreSettings((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, phone: e.target.value },
                  }))
                }
                className="input-focus"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              type="text"
              placeholder="Rua das Flores, 123 - Centro"
              value={storeSettings.footer?.address || ""}
              onChange={(e) =>
                setStoreSettings((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, address: e.target.value },
                }))
              }
              className="input-focus"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weekdayHours">Horário (Seg-Sex)</Label>
              <Input
                id="weekdayHours"
                type="text"
                placeholder="Segunda a Sexta: 11h - 23h"
                value={storeSettings.footer?.weekdayHours || ""}
                onChange={(e) =>
                  setStoreSettings((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, weekdayHours: e.target.value },
                  }))
                }
                className="input-focus"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saturdayHours">Horário (Sábado)</Label>
              <Input
                id="saturdayHours"
                type="text"
                placeholder="Sábado: 11h - 00h"
                value={storeSettings.footer?.saturdayHours || ""}
                onChange={(e) =>
                  setStoreSettings((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, saturdayHours: e.target.value },
                  }))
                }
                className="input-focus"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sundayHours">Horário (Domingo)</Label>
              <Input
                id="sundayHours"
                type="text"
                placeholder="Domingo: 12h - 22h"
                value={storeSettings.footer?.sundayHours || ""}
                onChange={(e) =>
                  setStoreSettings((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, sundayHours: e.target.value },
                  }))
                }
                className="input-focus"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end sticky bottom-4">
        <Button onClick={handleSave} size="lg" className="btn-animate shadow-lg w-full sm:w-auto">
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Salvo!
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </div>
    </div>
  )
}
