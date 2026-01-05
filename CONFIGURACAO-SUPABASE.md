# Guia Completo de Configuração do Supabase

Este guia explica passo a passo como configurar o banco de dados Supabase para o seu sistema de delivery.

---

## 1. Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Faça login com GitHub ou crie uma conta
4. Clique em **"New Project"**
5. Escolha uma organização (ou crie uma)
6. Preencha:
   - **Name**: Nome do projeto (ex: `meu-delivery`)
   - **Database Password**: Crie uma senha forte (guarde-a!)
   - **Region**: Escolha `South America (São Paulo)` para menor latência
7. Clique em **"Create new project"**
8. Aguarde a criação (pode levar alguns minutos)

---

## 2. Obter as Chaves de API

Após o projeto ser criado:

1. No menu lateral, clique em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"API"** no submenu
3. Copie as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: Chave pública (começa com `eyJ...`)

---

## 3. Configurar Variáveis de Ambiente

### No Vercel (Produção):

1. Acesse seu projeto no [Vercel](https://vercel.com)
2. Vá em **Settings** > **Environment Variables**
3. Adicione as variáveis:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (sua anon key) |

4. Clique em **Save**
5. Faça um novo deploy para aplicar as mudanças

### Localmente (Desenvolvimento):

Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
\`\`\`

---

## 4. Criar as Tabelas no Banco de Dados

1. No Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. Cole o conteúdo do arquivo `scripts/001-create-tables.sql`
4. Clique em **"Run"** (ou Ctrl+Enter)
5. Verifique se aparece "Success. No rows returned" (isso é normal)

---

## 5. Criar o Administrador

1. Ainda no SQL Editor, clique em **"New query"**
2. Cole o conteúdo do arquivo `scripts/002-create-admin.sql`
3. **IMPORTANTE**: Antes de executar, altere:
   - `'00000000000'` para seu CPF (apenas números)
   - `'admin123'` para uma senha segura
4. Clique em **"Run"**

### Exemplo com seus dados:

\`\`\`sql
INSERT INTO admin_users (cpf_cnpj, name, password_hash)
VALUES (
  '12345678900',           -- Seu CPF real
  'João da Silva',          -- Seu nome
  crypt('minhaSenhaForte123', gen_salt('bf'))
);
\`\`\`

---

## 6. (Opcional) Inserir Dados de Exemplo

1. No SQL Editor, clique em **"New query"**
2. Cole o conteúdo do arquivo `scripts/003-seed-data.sql`
3. Clique em **"Run"**

Isso irá criar produtos e categorias de exemplo.

---

## 7. Verificar a Configuração

### Testar as tabelas:

No SQL Editor, execute:

\`\`\`sql
SELECT * FROM admin_users;
SELECT * FROM products;
SELECT * FROM categories;
\`\`\`

### Testar o login:

1. Acesse seu site em `/admin`
2. Digite o CPF/CNPJ que você cadastrou
3. Digite a senha que você definiu
4. Se tudo estiver correto, você entrará no painel

---

## Comandos Úteis

### Adicionar novo administrador:

\`\`\`sql
INSERT INTO admin_users (cpf_cnpj, name, password_hash)
VALUES (
  '98765432100',
  'Maria Santos',
  crypt('senhaSegura456', gen_salt('bf'))
);
\`\`\`

### Alterar senha de um administrador:

\`\`\`sql
UPDATE admin_users
SET password_hash = crypt('novaSenha123', gen_salt('bf'))
WHERE cpf_cnpj = '12345678900';
\`\`\`

### Remover um administrador:

\`\`\`sql
DELETE FROM admin_users
WHERE cpf_cnpj = '98765432100';
\`\`\`

### Ver todos os pedidos:

\`\`\`sql
SELECT * FROM orders ORDER BY created_at DESC;
\`\`\`

### Ver pedidos pendentes:

\`\`\`sql
SELECT * FROM orders 
WHERE status = 'novo' 
ORDER BY created_at DESC;
\`\`\`

---

## Solução de Problemas

### "Variáveis de ambiente não configuradas"

- Verifique se as variáveis estão corretas no Vercel
- Faça um novo deploy após adicionar as variáveis
- Verifique se os nomes estão exatamente como mostrado acima

### "CPF/CNPJ não encontrado"

- Verifique se você executou o script 002-create-admin.sql
- Confirme que o CPF foi digitado apenas com números
- Execute `SELECT * FROM admin_users;` para verificar

### "Senha incorreta"

- A senha é case-sensitive (diferencia maiúsculas/minúsculas)
- Tente alterar a senha usando o comando SQL de alteração acima

### Erro de conexão

- Verifique se a URL do Supabase está correta
- Confirme que a anon key está completa (é uma string longa)
- Verifique se o projeto Supabase está ativo

---

## Estrutura das Tabelas

| Tabela | Descrição |
|--------|-----------|
| `admin_users` | Administradores do sistema |
| `products` | Produtos do cardápio |
| `categories` | Categorias de produtos |
| `orders` | Pedidos dos clientes |
| `store_settings` | Configurações da loja |

---

## Segurança

- **Nunca compartilhe** sua service_role key
- A anon key pode ser exposta (é segura para uso público)
- Mantenha sua senha do banco de dados em segredo
- Use senhas fortes para os administradores
- O sistema usa bcrypt para criptografar senhas

---

## Suporte

Se tiver problemas:
1. Verifique os logs no Supabase (Database > Logs)
2. Verifique os logs no Vercel (Deployments > Functions)
3. Confira se todas as variáveis estão configuradas corretamente
