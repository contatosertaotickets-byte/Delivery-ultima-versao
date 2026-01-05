-- =============================================
-- SCRIPT 3: Dados de Exemplo (Opcional)
-- Execute após os scripts 001 e 002
-- =============================================

-- Inserir categorias
INSERT INTO categories (name, sort_order) VALUES
  ('Pratos Principais', 1),
  ('Lanches', 2),
  ('Bebidas', 3),
  ('Sobremesas', 4)
ON CONFLICT DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, image, category, available) VALUES
  ('X-Burger Especial', 'Hambúrguer artesanal 180g, queijo cheddar, bacon crocante, alface, tomate e molho especial', 32.90, '/placeholder.svg?height=300&width=400', 'Lanches', true),
  ('Pizza Margherita', 'Molho de tomate, mussarela de búfala, manjericão fresco e azeite', 45.90, '/placeholder.svg?height=300&width=400', 'Pratos Principais', true),
  ('Refrigerante Lata', 'Coca-Cola, Guaraná ou Sprite 350ml', 6.00, '/placeholder.svg?height=300&width=400', 'Bebidas', true),
  ('Petit Gateau', 'Bolinho de chocolate com interior cremoso, servido com sorvete de creme', 18.90, '/placeholder.svg?height=300&width=400', 'Sobremesas', true),
  ('Filé à Parmegiana', 'Filé empanado com molho de tomate e queijo gratinado, acompanha arroz e fritas', 52.90, '/placeholder.svg?height=300&width=400', 'Pratos Principais', true),
  ('Suco Natural', 'Laranja, limão, maracujá ou abacaxi 500ml', 9.90, '/placeholder.svg?height=300&width=400', 'Bebidas', true)
ON CONFLICT DO NOTHING;

-- Inserir configurações padrão da loja
INSERT INTO store_settings (key, value) VALUES
  ('store', '{"name": "Sabor da Casa", "logo": null, "logoSize": "medium", "whatsappPedidos": "5511999999999"}'),
  ('footer', '{"slogan": "O melhor sabor da cidade, agora com delivery direto na sua casa.", "whatsapp": "(11) 99999-9999", "phone": "(11) 99999-9999", "address": "Rua das Flores, 123 - Centro", "weekdayHours": "Segunda a Sexta: 11h - 23h", "weekendHours": "Sábado e Domingo: 11h - 00h"}'),
  ('delivery', '{"deliveryFee": 5.00, "minimumOrder": 25.00, "freeDeliveryThreshold": null}'),
  ('pix', '{"enabled": true, "key": "pix@restaurante.com", "holder": "Restaurante Exemplo", "bank": "Banco Exemplo", "qrCodeImage": null}')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();
