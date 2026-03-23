import requests
import logging

logger = logging.getLogger(__name__)

class TelegramAPI:
    """
    Gerencia a comunicação com a Telegram Bot API.
    """
    def __init__(self, token: str):
        self.token = token
        self.base_url = f"https://api.telegram.org/bot{self.token}"

    def send_message(self, chat_id: str, text: str):
        """
        Envia uma mensagem de texto para um chat (usuário ou grupo).
        
        O chat_id é o ID do chat (pode ser o ID do grupo ou o ID do usuário).
        No contexto do Webhook, o chat_id é extraído do payload da mensagem recebida.
        """
        
        # A Telegram Bot API usa o método sendMessage
        url = f"{self.base_url}/sendMessage"
        
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown" # Permite formatação básica na resposta
        }

        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            logger.info(f"Mensagem enviada com sucesso para chat_id {chat_id}. Resposta: {response.json()}")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao enviar mensagem para chat_id {chat_id}: {e}")
            logger.error(f"Resposta da API: {response.text if 'response' in locals() else 'N/A'}")
            return None

    def set_webhook(self, webhook_url: str):
        """
        Configura o Webhook para a URL da aplicação.
        """
        url = f"{self.base_url}/setWebhook"
        payload = {
            "url": webhook_url
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            logger.info(f"Webhook configurado com sucesso para {webhook_url}. Resposta: {response.json()}")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao configurar Webhook para {webhook_url}: {e}")
            logger.error(f"Resposta da API: {response.text if 'response' in locals() else 'N/A'}")
            return None
