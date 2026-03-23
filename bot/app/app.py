import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
import logging
from datetime import datetime

# Carrega variáveis de ambiente do .env
load_dotenv()

# Configuração de Logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Variáveis de Ambiente
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
DATA_DIR = os.getenv("DATA_DIR", "./data")
USER_MAPPING_STR = os.getenv("USER_MAPPING")

# Validação de variáveis críticas
if not TELEGRAM_BOT_TOKEN:
    logger.error("TELEGRAM_BOT_TOKEN não configurado!")
    raise ValueError("TELEGRAM_BOT_TOKEN é obrigatório")

# Mapeamento de usuários
USER_MAPPING = {}
if USER_MAPPING_STR:
    try:
        for pair in USER_MAPPING_STR.split(','):
            user_id, name = pair.split('=')
            USER_MAPPING[user_id.strip()] = name.strip()
        logger.info(f"User mapping carregado: {list(USER_MAPPING.keys())}")
    except ValueError:
        logger.error("Erro ao parsear USER_MAPPING. Formato: ID1=Nome1,ID2=Nome2")
else:
    logger.warning("USER_MAPPING não configurado!")

# Importa as classes de utilidade
from app.utils import (
    CSVManager, 
    TelegramAPI, 
    parse_gasto_message, 
    extract_message_data, 
    format_gasto_response
)

# Inicializa os managers
try:
    csv_manager = CSVManager(DATA_DIR)
    telegram_api = TelegramAPI(TELEGRAM_BOT_TOKEN)
    logger.info("✅ Managers inicializados com sucesso")
except Exception as e:
    logger.error(f"❌ Erro ao inicializar managers: {e}")
    raise

# Inicialização do FastAPI
app = FastAPI(title="Telegram Expense Bot", version="2.0.0")

@app.get("/")
async def root():
    return {
        "message": "Telegram Expense Bot está rodando!",
        "version": "2.0.0",
        "status": "online",
        "storage": "CSV",
        "users_mapped": len(USER_MAPPING),
        "categorias": csv_manager.get_categorias()
    }

@app.get("/setup")
async def setup_webhook(request: Request):
    """
    Endpoint para configurar o webhook automaticamente.
    Acesse: https://seu-dominio.onrender.com/setup
    """
    base_url = str(request.base_url).rstrip('/')
    webhook_url = f"{base_url}/webhook/{TELEGRAM_BOT_TOKEN}"
    
    result = telegram_api.set_webhook(webhook_url)
    
    if result and result.get('ok'):
        return {
            "status": "success",
            "message": "Webhook configurado com sucesso!",
            "webhook_url": webhook_url,
            "telegram_response": result
        }
    else:
        raise HTTPException(
            status_code=500, 
            detail=f"Falha ao configurar webhook: {result}"
        )

@app.get("/webhook-info")
async def get_webhook_info():
    """
    Verifica o status atual do webhook.
    """
    import requests
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
    response = requests.get(url)
    return response.json()

@app.get("/resumo/{mes}/{ano}")
async def get_resumo(mes: int, ano: int):
    """
    Retorna resumo dos gastos do mês.
    """
    resumo = csv_manager.get_resumo_mes(mes, ano)
    return resumo

@app.post("/webhook/{token}")
async def handle_webhook(request: Request, token: str):
    """
    Endpoint para receber eventos do Telegram.
    """
    if token != TELEGRAM_BOT_TOKEN:
        logger.error(f"Tentativa de acesso com token inválido")
        raise HTTPException(status_code=403, detail="Token inválido")
        
    try:
        data = await request.json()
        logger.info(f"📨 Evento recebido do Telegram")
    except Exception as e:
        logger.error(f"Erro ao parsear JSON: {e}")
        raise HTTPException(status_code=400, detail="JSON inválido")

    message_data = extract_message_data(data)
    
    if not message_data:
        logger.info("Nenhuma mensagem de texto válida")
        return {"status": "ok", "message": "Evento ignorado"}

    chat_id = message_data['chat_id']
    user_id = message_data['user_id']
    text = message_data['text']
    
    logger.info(f"💬 user_id={user_id}, chat_id={chat_id}: {text}")
    
    # Comando /start
    if text.lower() == "/start":
        welcome_msg = (
            "👋 *Bem-vindo ao Bot de Controle de Gastos!*\n\n"
            "📝 *Comandos disponíveis:*\n"
            "• `/gasto` - Registrar novo gasto\n"
            "• `/resumo` - Ver resumo do mês\n"
            "• `/categorias` - Listar categorias\n"
            "• `/help` - Ajuda\n\n"
            "*Formato do gasto:*\n"
            "`/gasto <categoria> <valor> <conta> <data DD/MM> <descrição>`\n\n"
            "*Exemplo:*\n"
            "`/gasto mercado 52.90 nubank 08/11 pão e leite`\n\n"
            f"🆔 Seu ID: `{user_id}`"
        )
        telegram_api.send_message(chat_id, welcome_msg)
        return {"status": "ok"}
    
    # Comando /help
    if text.lower() == "/help":
        help_msg = (
            "📖 *Ajuda - Bot de Gastos*\n\n"
            "*Registrar gasto:*\n"
            "`/gasto <categoria> <valor> <conta> <data> <descrição>`\n\n"
            "*Exemplos válidos:*\n"
            "• `/gasto mercado 52.90 nubank 08/11 pão e leite`\n"
            "• `/gasto lazer 150 dinheiro 07/11 cinema`\n"
            "• `/gasto transporte 45.50 itau 08/11 uber`\n\n"
            "*Dicas:*\n"
            "✓ Valor pode usar ponto ou vírgula\n"
            "✓ Data no formato DD/MM\n"
            "✓ Descrição é livre (pode ter espaços)\n"
            "✓ Use `/categorias` para ver categorias"
        )
        telegram_api.send_message(chat_id, help_msg)
        return {"status": "ok"}
    
    # Comando /categorias
    if text.lower() == "/categorias":
        categorias = csv_manager.get_categorias()
        cat_msg = "📂 *Categorias disponíveis:*\n\n"
        cat_msg += "\n".join([f"• {cat}" for cat in categorias])
        telegram_api.send_message(chat_id, cat_msg)
        return {"status": "ok"}
    
    # Comando /resumo
    if text.lower().startswith("/resumo"):
        hoje = datetime.now()
        resumo = csv_manager.get_resumo_mes(hoje.month, hoje.year)
        
        meses = {
            1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
            5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
            9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
        }
        
        resumo_msg = f"📊 *Resumo - {meses[hoje.month]}/{hoje.year}*\n\n"
        resumo_msg += f"💰 *Total gasto:* R$ {resumo['total']:.2f}\n\n"
        
        if resumo['por_categoria']:
            resumo_msg += "*Por categoria:*\n"
            for cat, valor in resumo['por_categoria'].items():
                resumo_msg += f"• {cat}: R$ {valor:.2f}\n"
            resumo_msg += "\n"
        
        if resumo['por_pessoa']:
            resumo_msg += "*Por pessoa:*\n"
            for pessoa, valor in resumo['por_pessoa'].items():
                resumo_msg += f"• {pessoa}: R$ {valor:.2f}\n"
        
        telegram_api.send_message(chat_id, resumo_msg)
        return {"status": "ok"}
    
    # Comando /gasto
    if not text.lower().startswith("/gasto"):
        logger.info("Mensagem ignorada (não é comando conhecido)")
        return {"status": "ok"}

    # Processa o gasto
    gasto = parse_gasto_message(text)
    
    if not gasto:
        error_msg = (
            "❌ *Formato inválido!*\n\n"
            "Use: `/gasto <categoria> <valor> <conta> <data DD/MM> <descrição>`\n\n"
            "*Exemplo:*\n"
            "`/gasto mercado 52.90 nubank 08/11 pão e leite`"
        )
        telegram_api.send_message(chat_id, error_msg)
        return {"status": "error", "message": "Formato inválido"}

    # Identifica a pessoa
    pessoa = USER_MAPPING.get(user_id, "Desconhecido")
    if pessoa == "Desconhecido":
        warning_msg = (
            f"⚠️ *ID não mapeado!*\n\n"
            f"ID: `{user_id}`\n\n"
            f"O gasto será registrado como 'Desconhecido'."
        )
        logger.warning(f"User ID {user_id} não mapeado")
        telegram_api.send_message(chat_id, warning_msg)

    try:
        # 1. Registrar no CSV
        logger.info(f"💾 Registrando: {gasto.categoria} - R$ {gasto.valor}")
        registro_sucesso = csv_manager.registrar_gasto(
            gasto.categoria, 
            gasto.valor, 
            gasto.conta, 
            gasto.data, 
            gasto.descricao, 
            pessoa
        )
        
        if not registro_sucesso:
            raise Exception("Falha ao gravar no CSV")

        # 2. Calcular limite
        data_obj = datetime.strptime(gasto.data, '%d/%m')
        ano = datetime.now().year
        mes = data_obj.month
        
        limite_restante = csv_manager.calcular_limite_restante(
            gasto.categoria, mes, ano
        )
        
        # 3. Responder no Telegram
        response_text = format_gasto_response(gasto, pessoa, limite_restante)
        telegram_api.send_message(chat_id, response_text)
        
        logger.info(f"✅ Gasto registrado com sucesso para {pessoa}")
        
    except Exception as e:
        logger.error(f"❌ Erro ao processar gasto: {e}", exc_info=True)
        error_msg = (
            f"❌ *Erro ao registrar gasto*\n\n"
            f"Detalhes: `{str(e)}`\n\n"
            f"Tente novamente ou contate o administrador."
        )
        telegram_api.send_message(chat_id, error_msg)
        return {"status": "error", "message": str(e)}

    return {"status": "ok", "message": "Gasto registrado"}

@app.on_event("startup")
async def startup_event():
    """
    Executa ao iniciar a aplicação
    """
    logger.info("=" * 60)
    logger.info("🚀 Telegram Expense Bot Iniciado!")
    logger.info(f"📁 Diretório de dados: {DATA_DIR}")
    logger.info(f"👥 Usuários mapeados: {len(USER_MAPPING)}")
    logger.info(f"📂 Categorias: {len(csv_manager.get_categorias())}")
    logger.info(f"🔑 Token: {TELEGRAM_BOT_TOKEN[:10]}...")
    logger.info("=" * 60)
    
    # Verifica o webhook
    import requests
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"
        response = requests.get(url)
        webhook_info = response.json()
        
        if webhook_info.get('result', {}).get('url'):
            logger.info(f"✅ Webhook: {webhook_info['result']['url']}")
        else:
            logger.warning("⚠️ Webhook NÃO configurado! Acesse /setup")
    except Exception as e:
        logger.error(f"Erro ao verificar webhook: {e}")