"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getProducts, saveProducts } from "@/lib/store"
import { categories } from "@/lib/config"
import type { Product } from "@/lib/types"
import { Plus, Pencil, Trash2, Upload, X, ImageIcon } from "lucide-react"

export function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: categories[0],
    available: true,
  })

  useEffect(() => {
    setProducts(getProducts())
    setMounted(true)
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: categories[0],
      available: true,
    })
    setEditingProduct(null)
    setImagePreview(null)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      available: product.available,
    })
    setImagePreview(product.image || null)
    setIsDialogOpen(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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
        const base64String = reader.result as string
        setImagePreview(base64String)
        setFormData((prev) => ({ ...prev, image: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setFormData((prev) => ({ ...prev, image: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDelete = (productId: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      const updated = products.filter((p) => p.id !== productId)
      setProducts(updated)
      saveProducts(updated)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      image: formData.image || `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(formData.name)} food`,
      category: formData.category,
      available: formData.available,
    }

    let updated: Product[]
    if (editingProduct) {
      updated = products.map((p) => (p.id === editingProduct.id ? productData : p))
    } else {
      updated = [...products, productData]
    }

    setProducts(updated)
    saveProducts(updated)
    setIsDialogOpen(false)
    resetForm()
  }

  const toggleAvailability = (productId: string) => {
    const updated = products.map((p) => (p.id === productId ? { ...p, available: !p.available } : p))
    setProducts(updated)
    saveProducts(updated)
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  if (!mounted) {
    return <p className="text-muted-foreground">Carregando produtos...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Produtos ({products.length})</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 btn-animate w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Imagem do Produto</Label>
                <div className="flex flex-col items-center gap-3">
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 btn-animate"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-red-500 hover:bg-red-50/50 transition-all duration-200 active:scale-[0.98]"
                    >
                      <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                      <span className="text-sm text-muted-foreground">Clique para fazer upload</span>
                      <span className="text-xs text-muted-foreground/70">PNG, JPG ou WEBP (máx. 2MB)</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {!imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full btn-animate"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Imagem
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Se nenhuma imagem for enviada, uma será gerada automaticamente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="input-focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  className="input-focus"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    required
                    className="input-focus"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, available: checked }))}
                />
                <Label htmlFor="available">Disponível para venda</Label>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 btn-animate">
                {editingProduct ? "Salvar Alterações" : "Adicionar Produto"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 stagger-children">
        {products.map((product) => (
          <Card key={product.id} className={`card-animate overflow-hidden ${!product.available ? "opacity-60" : ""}`}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex gap-3 sm:gap-4">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate text-sm sm:text-base">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.category}</p>
                  <p className="text-red-600 font-semibold mt-1 text-sm sm:text-base">{formatPrice(product.price)}</p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Switch checked={product.available} onCheckedChange={() => toggleAvailability(product.id)} />
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {product.available ? "Disponível" : "Indisponível"}
                  </span>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(product)}
                    className="btn-animate h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive bg-transparent btn-animate h-8 w-8 sm:h-9 sm:w-9"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
