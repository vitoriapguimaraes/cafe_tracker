# Cafe - Controle Financeiro Compartilhado

## Visão Geral

Sistema de controle financeiro para casais, focado em redução de fricção e design premium.

- **Bot Telegram**: Para lançamentos rápidos de gastos (`/gasto 50 almoço`).
- **Web Dashboard**: Para visualização clara de saldo, dívidas e metas.

## Estrutura do Projeto

- `/bot`: Código em Python do Bot do Telegram.
- `/web`: Dashboard desenvolvido em Next.js (React).
- `/supabase`: Arquivos SQL para o banco de dados.

## Configuração Inicial

### 1. Banco de Dados (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com/).
2. Vá em **SQL Editor** e cole o conteúdo de `supabase/migrations/0000_initial_schema.sql`. Execute para criar as tabelas.
3. Vá em **Settings > API** e copie a `Project URL` e a `anon public` Key.

### 2. Bot do Telegram

1. Fale com o [@BotFather](https://t.me/BotFather) no Telegram.
2. Crie um novo bot com `/newbot`.
3. Copie o **Token** gerado.

### 3. Configuração de Variáveis

1. Crie um arquivo `.env` na raiz do projeto (copie de `.env.example`).
2. Preencha com os dados do Supabase e do Telegram.
3. Crie um arquivo `web/.env.local` dentro da pasta `web`.

   ```env
   NEXT_PUBLIC_SUPABASE_URL="Sua URL do Supabase"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="Sua Key anon do Supabase"
   ```

## Como Rodar

### Bot (Terminal 1)

```bash
# Instale as dependências (se ainda não fez)
pip install -r bot/requirements.txt

# Rode o bot
python bot/main.py
```

### Web Dashboard (Terminal 2)

```bash
cd web
npm install
npm run dev
```

Acesse `http://localhost:3000` para ver o dashboard.

## Uso

- No Telegram, envie `/start` para começar.
- Use `/gasto 50.00 mercado` para registrar uma despesa.
- Acompanhe o saldo no Dashboard web.
