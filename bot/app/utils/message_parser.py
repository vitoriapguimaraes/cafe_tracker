import re
from typing import Optional, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class Gasto:
    """Modelo de dados para um gasto registrado."""
    def __init__(self, categoria: str, valor: float, conta: str, data: str, descricao: str):
        self.categoria = categoria
        self.valor = valor
        self.conta = conta
        self.data = data # Data no formato DD/MM
        self.descricao = descricao

def parse_gasto_message(text: str) -> Optional[Gasto]:
    """
    Analisa a mensagem de texto para extrair os dados do gasto.
    Formato esperado: /gasto <categoria> <valor> <conta/cartão> <data> <descrição livre>
    Exemplo: /gasto mercado 52.90 nubank 03/11 pão e leite
    """
    # Remove o prefixo /gasto e divide o restante
    if not text.lower().startswith("/gasto"):
        return None

    # A lógica de parsing do gasto é a mesma, pois o formato da mensagem é o mesmo.
    pattern = re.compile(r"^/gasto\s+(\w+)\s+(?:R\$\s*)?([\d.,]+)\s+(\w+)\s+(\d{1,2}[/-]\d{1,2})\s*(.*)$", re.IGNORECASE)
    match = pattern.match(text.strip())

    if not match:
        logger.warning(f"Mensagem de gasto inválida: {text}")
        return None

    try:
        categoria = match.group(1).strip()
        valor_str = match.group(2).replace(',', '.') # Substitui vírgula por ponto para float
        valor = float(valor_str)
        conta = match.group(3).strip()
        data_str = match.group(4).replace('-', '/') # Padroniza data para DD/MM
        descricao = match.group(5).strip()
        
        # Validação de data básica (apenas formato DD/MM)
        try:
            datetime.strptime(data_str, '%d/%m')
        except ValueError:
            logger.warning(f"Data inválida no formato DD/MM: {data_str}")
            return None

        return Gasto(categoria, valor, conta, data_str, descricao)

    except Exception as e:
        logger.error(f"Erro ao processar campos da mensagem: {e}")
        return None

def extract_message_data(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Extrai dados relevantes da mensagem do Webhook do Telegram.
    Retorna {'chat_id': str, 'user_id': str, 'text': str}
    """
    try:
        # O payload do Telegram é mais simples, focado em 'message'
        if 'message' not in payload:
            return None
        
        message = payload['message']
        
        # Ignora mensagens que não são de texto
        if 'text' not in message:
            return None
            
        chat_id = str(message['chat']['id']) # ID do chat (grupo ou privado)
        user_id = str(message['from']['id']) # ID do usuário (remetente)
        text = message['text']
        
        # O Telegram suporta grupos nativamente. O chat_id será o ID do grupo (negativo)
        # ou o ID do usuário (positivo). A resposta deve ser enviada para o chat_id.
        
        return {
            'chat_id': chat_id,
            'user_id': user_id,
            'text': text,
        }
        
    except (KeyError, IndexError) as e:
        logger.warning(f"Payload do Webhook do Telegram com estrutura inesperada: {e}")
        return None

def format_gasto_response(gasto: Gasto, pessoa: str, limite_restante: float) -> str:
    """
    Formata a mensagem de resposta para o Telegram (usando Markdown).
    """
    response = f"✅ *Gasto registrado!*\n"
    response += f"Categoria: `{gasto.categoria.capitalize()}`\n"
    response += f"Valor: *R$ {gasto.valor:.2f}*\n"
    response += f"Data: {gasto.data}\n"
    response += f"Conta: {gasto.conta.capitalize()}\n"
    response += f"Pessoa: *{pessoa}*\n"
    response += f"Descrição: _{gasto.descricao}_\n\n"
    
    # Mês atual para o limite
    # O Telegram não suporta formatação de data em português nativamente, mas o Python sim.
    # Para garantir que o mês esteja em português, vamos usar um mapeamento simples.
    meses = {
        1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril", 
        5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto", 
        9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
    }
    
    try:
        mes_num = datetime.strptime(gasto.data, '%d/%m').month
        mes_atual = meses.get(mes_num, "Mês Desconhecido")
    except ValueError:
        mes_atual = "Mês Desconhecido"
    
    response += f"💰 *Limite disponível restante* para {gasto.categoria.capitalize()} em {mes_atual}: *R$ {limite_restante:.2f}*"
    
    return response
