-- =============================================
-- SCRIPT 2: Criar Administrador
-- Execute após o script 001
-- =============================================

-- IMPORTANTE: Altere os valores abaixo antes de executar!
-- CPF/CNPJ: apenas números (ex: 12345678900 para CPF ou 12345678000190 para CNPJ)
-- SENHA: será criptografada automaticamente

-- Inserir administrador padrão
-- Senha: admin123 (altere para uma senha segura!)
INSERT INTO admin_users (cpf_cnpj, name, password_hash)
VALUES (
  '00000000000', -- Altere para seu CPF (apenas números)
  'Administrador',
  crypt('admin123', gen_salt('bf')) -- Altere 'admin123' para sua senha
)
ON CONFLICT (cpf_cnpj) DO UPDATE
SET 
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- =============================================
-- COMO ADICIONAR MAIS ADMINISTRADORES:
-- =============================================
-- Copie e cole o comando abaixo, alterando os valores:
--
-- INSERT INTO admin_users (cpf_cnpj, name, password_hash)
-- VALUES (
--   '12345678900', -- CPF do novo admin
--   'Nome do Admin',
--   crypt('senha_segura', gen_salt('bf'))
-- );
--
-- =============================================
-- COMO ALTERAR A SENHA DE UM ADMIN:
-- =============================================
-- UPDATE admin_users
-- SET password_hash = crypt('nova_senha', gen_salt('bf'))
-- WHERE cpf_cnpj = '00000000000';
