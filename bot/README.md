# 🤖 Telegram Expense Bot (Bot de Registro de Gastos para Telegram)

Este projeto implementa um bot de registro de gastos para grupos do Telegram, utilizando **Python**, **FastAPI** e a **Telegram Bot API**. O bot foi desenvolvido para ser uma solução **totalmente gratuita** e utiliza arquivos **CSV** para armazenamento simples e confiável.

## ✨ Funcionalidades

*   **Registro em Linha:** Registra gastos com o comando `/gasto <categoria> <valor> <conta/cartão> <data DD/MM> <descrição livre>`
*   **Armazenamento em CSV:** Salva os dados em arquivos CSV (`gastos.csv` e `categorias.csv`)
*   **Controle de Teto:** Calcula e informa o limite restante para a categoria no mês
*   **Identificação de Usuário:** Identifica automaticamente quem registrou o gasto
*   **Resumo Mensal:** Comando `/resumo` para visualizar gastos do mês
*   **Listagem de Categorias:** Comando `/categorias` para ver todas as categorias disponíveis
*   **Webhook:** Recebe e processa mensagens em tempo real

## 🛠️ Tecnologias Utilizadas

*   **Python 3.10+**
*   **FastAPI:** Framework web para o Webhook
*   **pandas:** Para manipulação dos arquivos CSV
*   **Telegram Bot API:** Para comunicação com o Telegram (solução gratuita)
*   **python-dotenv:** Para gerenciamento de variáveis de ambiente

## 📂 Estrutura do Projeto

```
telegram_expense_bot/
├── app/
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── csv_manager.py        # Lógica de leitura/escrita dos CSVs
│   │   ├── message_parser.py     # Lógica de parsing de mensagens
│   │   └── telegram_api.py       # Comunicação com a Telegram Bot API
│   └── app.py                    # Aplicação principal (FastAPI e Webhook)
├── data/
│   ├── gastos.csv                # Registro de todos os gastos
│   └── categorias.csv            # Categorias e tetos mensais
├── .env                          # Arquivo de configuração
├── requirements.txt              # Dependências do Python
└── README.md                     # Este arquivo
```

## ⚙️ Instalação e Configuração

### 1. Pré-requisitos

*   **Token do Bot Telegram:** 
    1. Abra o Telegram e procure por **@BotFather**
    2. Envie `/newbot` e siga as instruções
    3. Copie o token fornecido (formato: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

*   **IDs dos Usuários do Telegram:**
    1. Procure por **@userinfobot** no Telegram
    2. Envie `/start` para ele
    3. Anote seu ID numérico (ex: `123456789`)

*   **Hospedagem Gratuita:** Render, Railway ou Fly.io com HTTPS

### 2. Configuração do Ambiente

1.  **Clone ou baixe o projeto**

2.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Crie o arquivo `.env` na raiz do projeto:**
    ```bash
    # Token do seu bot (obrigatório)
    TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"

    # Diretório onde os CSVs serão salvos
    DATA_DIR="./data"

    # Mapeamento de IDs para nomes
    # Formato: ID1=Nome1,ID2=Nome2
    USER_MAPPING="123456789=Vitória,987654321=João"
    ```

### 3. Estrutura dos Arquivos CSV

Os arquivos serão criados automaticamente na primeira execução:

#### **gastos.csv**
Armazena todos os gastos registrados:
```csv
data,categoria,valor,conta,descricao,pessoa,mes,ano
08/11/2025,Mercado,52.90,Nubank,pão e leite,Vitória,11,2025
```

#### **categorias.csv**
Define as categorias e seus tetos mensais:
```csv
categoria,teto_mensal
Mercado,500.00
Lazer,300.00
Transporte,200.00
Restaurante,400.00
Saúde,300.00
Casa,500.00
Educação,300.00
Vestuário,200.00
Outros,200.00
```

**Para ajustar tetos:** Edite o arquivo `data/categorias.csv` diretamente ou use um editor de planilhas.

## 🚀 Deploy no Render (Gratuito)

### Passo 1: Preparar o Repositório

1. Crie um repositório no GitHub com seu código
2. Certifique-se de ter o arquivo `requirements.txt`:
   ```
   fastapi
   uvicorn[standard]
   python-dotenv
   pandas
   requests
   ```

### Passo 2: Criar Web Service no Render

1. Acesse [render.com](https://render.com) e faça login
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub
4. Configure:
   - **Name:** `bot-finance` (ou outro nome)
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.app:app --host 0.0.0.0 --port $PORT`

### Passo 3: Configurar Variáveis de Ambiente

No painel do Render, vá em **Environment** e adicione:

```
TELEGRAM_BOT_TOKEN=seu_token_completo_aqui
DATA_DIR=./data
USER_MAPPING=ID_VITORIA=Vitória,ID_JOAO=João
```

### Passo 4: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (pode levar alguns minutos)
3. Anote a URL do seu serviço (ex: `https://bot-finance-yr5y.onrender.com`)

### Passo 5: Configurar o Webhook

**Opção A - Automática (Recomendado):**

Acesse no navegador:
```
https://SEU_DOMINIO.onrender.com/setup
```

**Opção B - Manual:**

Acesse no navegador (substitua os valores):
```
https://api.telegram.org/botSEU_TOKEN/setWebhook?url=https://SEU_DOMINIO.onrender.com/webhook/SEU_TOKEN
```

Você deve ver uma resposta:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Passo 6: Verificar Status

Acesse:
```
https://SEU_DOMINIO.onrender.com/
```

Resposta esperada:
```json
{
  "message": "Telegram Expense Bot está rodando!",
  "version": "2.0.0",
  "status": "online",
  "storage": "CSV",
  "users_mapped": 2,
  "categorias": ["Mercado", "Lazer", ...]
}
```

## 💬 Comandos do Bot

### Comandos Básicos

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `/start` | Inicia o bot e mostra boas-vindas | `/start` |
| `/help` | Mostra ajuda e exemplos | `/help` |
| `/categorias` | Lista todas as categorias | `/categorias` |
| `/resumo` | Mostra resumo do mês atual | `/resumo` |
| `/gasto` | Registra um novo gasto | Ver abaixo |

### Registrar Gasto

**Formato:**
```
/gasto <categoria> <valor> <conta> <data DD/MM> <descrição>
```

**Exemplos válidos:**
```
/gasto mercado 52.90 nubank 08/11 pão e leite
/gasto lazer 150 dinheiro 07/11 cinema com amigos
/gasto transporte 45.50 itau 08/11 uber para trabalho
/gasto restaurante 85 credito 08/11 jantar romântico
```

**Resposta do bot:**
```
✅ Gasto registrado!
Categoria: Mercado
Valor: R$ 52.90
Data: 08/11
Conta: Nubank
Pessoa: Vitória
Descrição: pão e leite

💰 Limite disponível restante para Mercado em Novembro: R$ 447.10
```

### Ver Resumo do Mês

**Comando:**
```
/resumo
```

**Resposta:**
```
📊 Resumo - Novembro/2025

💰 Total gasto: R$ 1,245.50

Por categoria:
• Mercado: R$ 385.20
• Lazer: R$ 220.00
• Transporte: R$ 145.30
• Restaurante: R$ 495.00

Por pessoa:
• Vitória: R$ 678.40
• João: R$ 567.10
```

## 🔧 Endpoints da API

### Públicos

- `GET /` - Status do bot
- `GET /setup` - Configura webhook automaticamente
- `GET /webhook-info` - Verifica status do webhook
- `GET /resumo/{mes}/{ano}` - Resumo de gastos por período

### Webhook (Interno)

- `POST /webhook/{token}` - Recebe eventos do Telegram

## 🐛 Resolução de Problemas

### Bot não responde

1. **Verifique o webhook:**
   ```
   https://SEU_DOMINIO.onrender.com/webhook-info
   ```
   O campo `url` deve estar preenchido.

2. **Verifique os logs no Render:**
   - Acesse o dashboard do Render
   - Vá em "Logs"
   - Procure por erros

3. **Reconfigure o webhook:**
   ```
   https://SEU_DOMINIO.onrender.com/setup
   ```

### Usuário aparece como "Desconhecido"

1. Descubra seu ID com **@userinfobot**
2. Adicione no Render em **Environment:**
   ```
   USER_MAPPING=ID1=Nome1,ID2=Nome2
   ```
3. Faça um novo deploy (botão "Manual Deploy")

### Categoria não encontrada

1. Verifique se a categoria existe:
   ```
   /categorias
   ```

2. Para adicionar nova categoria, edite `data/categorias.csv` ou adicione via código

### Arquivo CSV corrompido

Se os arquivos CSV ficarem corrompidos:

1. No Render, acesse o **Shell**
2. Execute:
   ```bash
   rm -rf ./data/*.csv
   ```
3. Reinicie o serviço
4. Os arquivos serão recriados automaticamente

## 📊 Gerenciando Dados

### Baixar CSVs

Os arquivos CSV podem ser baixados e abertos no Excel, Google Sheets ou qualquer editor de planilhas.

### Backup Manual

Recomenda-se fazer backup regular dos CSVs. Você pode:
1. Baixar via FTP/SFTP (se disponível)
2. Implementar sincronização com Google Sheets
3. Adicionar endpoint de download na API

### Editar Tetos

Edite `data/categorias.csv`:
```csv
categoria,teto_mensal
Mercado,600.00
Lazer,400.00
```

O bot lerá automaticamente os novos valores.

## 🔒 Segurança

- O token do bot fica no path do webhook como medida de segurança adicional
- Apenas requisições com o token correto são processadas
- IDs do Telegram são usados para identificação (não nomes de usuário)
- Dados armazenados localmente em CSV (sem serviços externos)

## 📝 Notas Importantes

- **Free Tier do Render:** O serviço "dorme" após 15 min de inatividade. A primeira requisição pode demorar ~30s
- **Persistência:** Os CSVs são mantidos no filesystem do Render, mas podem ser perdidos em redeploys
- **Fuso Horário:** O bot usa o fuso horário do servidor (UTC). Os gastos são registrados com o ano atual
- **Formato de Data:** Apenas DD/MM é aceito. O ano é inferido automaticamente

## 🚀 Próximos Passos (Melhorias Futuras)

- [ ] Integração com Google Sheets para backup automático
- [ ] Gráficos e visualizações de gastos
- [ ] Alertas quando ultrapassar tetos
- [ ] Exportar relatório mensal em PDF
- [ ] Suporte a múltiplas moedas
- [ ] Categorias customizáveis via bot
- [ ] Divisão de gastos compartilhados

## 📄 Licença

MIT License - Sinta-se livre para usar e modificar!

---

**Desenvolvido com ❤️ para controle financeiro em casal**