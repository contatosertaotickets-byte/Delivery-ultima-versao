-- =============================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS DO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- Habilitar extensão pgcrypto para criptografia de senhas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_address TEXT,
  customer_notes TEXT,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('entrega', 'retirada')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'cartao', 'dinheiro')),
  change_for DECIMAL(10,2),
  pix_receipt TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_preparo', 'entregue')),
  pix_status TEXT CHECK (pix_status IN ('aguardando', 'confirmado', 'recusado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de administradores com CPF/CNPJ
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cpf_cnpj TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações da loja (formato chave-valor JSON)
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (leitura pública)
CREATE POLICY "Categorias são públicas" ON categories
  FOR SELECT USING (true);

-- Políticas para produtos (leitura pública)
CREATE POLICY "Produtos são visíveis publicamente" ON products
  FOR SELECT USING (true);

CREATE POLICY "Qualquer um pode inserir produtos" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar produtos" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Qualquer um pode deletar produtos" ON products
  FOR DELETE USING (true);

-- Políticas para pedidos
CREATE POLICY "Pedidos podem ser criados publicamente" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Pedidos são visíveis" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Pedidos podem ser atualizados" ON orders
  FOR UPDATE USING (true);

-- Políticas para itens do pedido
CREATE POLICY "Itens podem ser criados com pedidos" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Itens são visíveis" ON order_items
  FOR SELECT USING (true);

-- Políticas para admin_users (leitura para verificar login)
CREATE POLICY "Admin users podem ser lidos para login" ON admin_users
  FOR SELECT USING (true);

CREATE POLICY "Admin users podem ser inseridos" ON admin_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin users podem ser atualizados" ON admin_users
  FOR UPDATE USING (true);

-- Políticas para configurações da loja
CREATE POLICY "Configurações são públicas para leitura" ON store_settings
  FOR SELECT USING (true);

CREATE POLICY "Configurações podem ser inseridas" ON store_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Configurações podem ser atualizadas" ON store_settings
  FOR UPDATE USING (true);

-- =============================================
-- FUNÇÕES E TRIGGERS
-- =============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_settings_updated_at ON store_settings;
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_users_cpf_cnpj ON admin_users(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_store_settings_key ON store_settings(key);
