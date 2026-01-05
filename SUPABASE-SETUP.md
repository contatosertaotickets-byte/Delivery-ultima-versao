# Guia de Configuração do Supabase

Este guia explica como conectar seu restaurante delivery ao Supabase para persistir dados em um banco de dados real.

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Nome do projeto**: ex: `meu-restaurante-delivery`
   - **Senha do banco**: anote esta senha em local seguro
   - **Região**: escolha a mais próxima (ex: South America - São Paulo)
4. Clique em **"Create new project"** e aguarde a criação (~2 minutos)

## Passo 2: Obter as Credenciais

1. No painel do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API** no menu lateral
3. Copie os valores:
   - **Project URL** → será o `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (em Project API keys) → será o `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Passo 3: Configurar Variáveis de Ambiente

### No Vercel (Produção)

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** → **Environment Variables**
3. Adicione as variáveis:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |

4. Clique em **Save** e faça um novo deploy

### Local (Desenvolvimento)

Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
\`\`\`

## Passo 4: Criar as Tabelas

1. No Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. Cole o conteúdo do arquivo `scripts/001-create-tables.sql`
4. Clique em **"Run"** (ou Ctrl+Enter)
5. Verifique se não há erros

## Passo 5: Inserir Dados Iniciais (Opcional)

1. Ainda no SQL Editor, crie uma nova query
2. Cole o conteúdo do arquivo `scripts/002-seed-data.sql`
3. Clique em **"Run"**
4. Isso criará produtos de exemplo e configurações padrão

## Passo 6: Verificar a Instalação

1. Vá em **Table Editor** no menu do Supabase
2. Você deve ver as tabelas:
   - `products` - Produtos do cardápio
   - `orders` - Pedidos dos clientes
   - `order_items` - Itens de cada pedido
   - `delivery_settings` - Configurações de entrega
   - `store_settings` - Configurações da loja
   - `admin_users` - Usuários administradores

## Estrutura das Tabelas

### products
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do produto |
| description | TEXT | Descrição |
| price | DECIMAL | Preço |
| image | TEXT | URL da imagem |
| category | TEXT | Categoria |
| available | BOOLEAN | Disponível? |

### orders
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| customer_name | TEXT | Nome do cliente |
| customer_whatsapp | TEXT | WhatsApp |
| customer_address | TEXT | Endereço |
| delivery_type | TEXT | 'entrega' ou 'retirada' |
| payment_method | TEXT | 'pix', 'cartao' ou 'dinheiro' |
| status | TEXT | 'novo', 'em_preparo' ou 'entregue' |
| total | DECIMAL | Valor total |

## Segurança (RLS)

O script já configura Row Level Security (RLS) com as seguintes regras:

- **Produtos**: leitura pública, escrita apenas para admin autenticado
- **Pedidos**: criação pública, visualização/edição apenas para admin
- **Configurações**: leitura pública, edição apenas para admin

## Troubleshooting

### "Variáveis de ambiente não configuradas"
- Verifique se as variáveis estão corretas no `.env.local` ou Vercel
- Reinicie o servidor de desenvolvimento após alterar `.env.local`

### "Erro de conexão"
- Verifique se o projeto Supabase está ativo (não pausado)
- Confirme que a URL e chave estão corretas

### "Permissão negada"
- Verifique as políticas RLS no Supabase
- Para desenvolvimento, você pode temporariamente desabilitar RLS

## Próximos Passos

Após configurar o Supabase, a aplicação automaticamente usará o banco de dados para:
- Armazenar produtos do cardápio
- Salvar pedidos dos clientes
- Gerenciar configurações da loja

O código detecta automaticamente se o Supabase está configurado. Se não estiver, usa localStorage como fallback.
