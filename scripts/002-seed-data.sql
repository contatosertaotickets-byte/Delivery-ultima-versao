-- =============================================
-- DADOS INICIAIS (SEED)
-- Execute este script após criar as tabelas
-- =============================================

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, image, category, available) VALUES
  ('X-Burger', 'Hambúrguer artesanal com queijo, alface e tomate', 22.90, '/placeholder.svg?height=200&width=200', 'Hambúrgueres', true),
  ('X-Bacon', 'Hambúrguer com bacon crocante e queijo cheddar', 28.90, '/placeholder.svg?height=200&width=200', 'Hambúrgueres', true),
  ('X-Tudo', 'Hambúrguer completo com todos os ingredientes', 32.90, '/placeholder.svg?height=200&width=200', 'Hambúrgueres', true),
  ('Pizza Margherita', 'Molho de tomate, mussarela e manjericão fresco', 45.90, '/placeholder.svg?height=200&width=200', 'Pizzas', true),
  ('Pizza Calabresa', 'Calabresa fatiada com cebola e azeitonas', 48.90, '/placeholder.svg?height=200&width=200', 'Pizzas', true),
  ('Batata Frita', 'Porção de batatas fritas crocantes', 15.90, '/placeholder.svg?height=200&width=200', 'Acompanhamentos', true),
  ('Onion Rings', 'Anéis de cebola empanados', 18.90, '/placeholder.svg?height=200&width=200', 'Acompanhamentos', true),
  ('Refrigerante Lata', 'Coca-Cola, Guaraná ou Fanta', 6.90, '/placeholder.svg?height=200&width=200', 'Bebidas', true),
  ('Suco Natural', 'Laranja, limão ou abacaxi', 9.90, '/placeholder.svg?height=200&width=200', 'Bebidas', true),
  ('Água Mineral', 'Garrafa 500ml', 4.90, '/placeholder.svg?height=200&width=200', 'Bebidas', true)
ON CONFLICT DO NOTHING;

-- Inserir configurações padrão de entrega
INSERT INTO delivery_settings (
  delivery_fee,
  minimum_order,
  free_delivery_threshold,
  pix_enabled,
  pix_key,
  pix_holder,
  pix_bank
) VALUES (
  5.00,
  25.00,
  NULL,
  true,
  'pix@restaurante.com',
  'Restaurante Exemplo',
  'Banco Exemplo'
) ON CONFLICT DO NOTHING;

-- Inserir configurações padrão da loja
INSERT INTO store_settings (name, logo_size) VALUES
  ('Sabor da Casa', 'medium')
ON CONFLICT DO NOTHING;
