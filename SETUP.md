# Guia de Configuração - Sistema de Delivery

Este documento explica como personalizar o sistema para seu restaurante.

---

## 1. Configurações Básicas do Restaurante

Edite o arquivo `lib/config.ts`:

\`\`\`typescript
export const restaurantConfig: RestaurantConfig = {
  name: "Nome do Seu Restaurante",      // Nome que aparece no site
  logo: "/sua-logo.png",                 // Caminho da logo (coloque na pasta public/)
  whatsapp: "5511999999999",             // Número do WhatsApp (com código do país)
  primaryColor: "#DC2626",               // Cor principal (vermelho padrão)
  secondaryColor: "#FFFFFF",             // Cor secundária (branco padrão)
}

export const categories = [
  "Pratos Principais", 
  "Lanches", 
  "Bebidas", 
  "Sobremesas"
]  // Edite as categorias conforme seu cardápio
\`\`\`

### Como trocar a logo:
1. Coloque sua imagem na pasta `public/`
2. Atualize o campo `logo` com o caminho (ex: `/minha-logo.png`)

---

## 2. Alterar Cores do Sistema

Edite o arquivo `app/globals.css` nas variáveis CSS:

\`\`\`css
:root {
  --primary: #DC2626;           /* Cor principal (botões, destaques) */
  --primary-foreground: #ffffff; /* Texto sobre cor principal */
  --accent: #fef2f2;            /* Cor de destaque suave */
  --accent-foreground: #991b1b;  /* Texto sobre accent */
  --ring: #dc2626;              /* Cor do foco/borda */
}
\`\`\`

### Paletas de cores sugeridas:

**Vermelho (padrão):**
- primary: `#DC2626`
- accent: `#fef2f2`
- accent-foreground: `#991b1b`

**Verde:**
- primary: `#16a34a`
- accent: `#f0fdf4`
- accent-foreground: `#166534`

**Azul:**
- primary: `#2563eb`
- accent: `#eff6ff`
- accent-foreground: `#1d4ed8`

**Laranja:**
- primary: `#ea580c`
- accent: `#fff7ed`
- accent-foreground: `#c2410c`

---

## 3. Configurar Senha do Admin

Edite o arquivo `contexts/auth-context.tsx`:

\`\`\`typescript
const ADMIN_PASSWORD = "sua_senha_secura_aqui"
\`\`\`

**Importante:** Em produção, nunca deixe senhas no código. Use variáveis de ambiente.

---

## 4. Conectar Supabase (Banco de Dados)

Para usar um banco de dados real em vez de localStorage:

### Passo 1: Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e a chave anônima (anon key)

### Passo 2: Variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
\`\`\`

### Passo 3: Criar tabelas no Supabase

Execute este SQL no editor do Supabase:

\`\`\`sql
-- Tabela de Produtos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública para produtos
CREATE POLICY "Produtos visíveis para todos" ON products
  FOR SELECT USING (true);

-- Políticas para pedidos (apenas inserção pública)
CREATE POLICY "Clientes podem criar pedidos" ON orders
  FOR INSERT WITH CHECK (true);
\`\`\`

### Passo 4: Instalar dependência

\`\`\`bash
npm install @supabase/ssr @supabase/supabase-js
\`\`\`

### Passo 5: Criar cliente Supabase

Crie o arquivo `lib/supabase.ts`:

\`\`\`typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
\`\`\`

### Passo 6: Atualizar lib/store.ts

Substitua as funções de localStorage pelas do Supabase:

\`\`\`typescript
import { createClient } from './supabase'

const supabase = createClient()

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('category')
  
  if (error) throw error
  return data || []
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function addOrder(order: Omit<Order, 'id'>): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
  
  if (error) throw error
}
\`\`\`

---

## 5. Alterar Dados de Exemplo

Edite o arquivo `lib/sample-data.ts` para trocar os produtos iniciais:

\`\`\`typescript
export const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Seu Produto",
    description: "Descrição do produto",
    price: 29.90,
    image: "/placeholder.svg?height=200&width=200",
    category: "Sua Categoria",
    available: true,
  },
  // Adicione mais produtos...
]
\`\`\`

---

## 6. Estrutura de Arquivos Importantes

\`\`\`
├── app/
│   ├── globals.css        # Cores e estilos globais
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   └── admin/
│       └── page.tsx       # Painel administrativo
├── components/
│   ├── header.tsx         # Cabeçalho
│   ├── hero-section.tsx   # Banner principal
│   ├── menu-section.tsx   # Cardápio
│   └── ...
├── contexts/
│   ├── auth-context.tsx   # Autenticação (senha admin)
│   └── cart-context.tsx   # Carrinho de compras
├── lib/
│   ├── config.ts          # CONFIGURAÇÕES PRINCIPAIS
│   ├── sample-data.ts     # Produtos de exemplo
│   ├── store.ts           # Funções de dados
│   └── types.ts           # Tipos TypeScript
└── public/
    └── sua-logo.png       # Coloque sua logo aqui
\`\`\`

---

## 7. Deploy na Vercel

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Importe o repositório
4. Adicione as variáveis de ambiente (se usar Supabase)
5. Clique em Deploy

---

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório ou entre em contato.
