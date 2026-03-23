import pandas as pd
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class CSVManager:
    """
    Gerencia a leitura e escrita em arquivos CSV de controle de gastos.
    """
    def __init__(self, data_dir="./data"):
        self.data_dir = data_dir
        self.gastos_file = os.path.join(data_dir, "gastos.csv")
        self.categorias_file = os.path.join(data_dir, "categorias.csv")
        self._ensure_directory()
        self._initialize_csv()

    def _ensure_directory(self):
        """
        Garante que o diretório de dados existe.
        """
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir, exist_ok=True)
            logger.info(f"Diretório criado: {self.data_dir}")

    def _initialize_csv(self):
        """
        Cria os arquivos CSV se não existirem.
        """
        # Inicializa gastos.csv
        if not os.path.exists(self.gastos_file):
            df_gastos = pd.DataFrame(columns=[
                "data", "categoria", "valor", "conta", 
                "descricao", "pessoa", "mes", "ano"
            ])
            df_gastos.to_csv(self.gastos_file, index=False, encoding='utf-8')
            logger.info(f"✅ Arquivo criado: {self.gastos_file}")
        else:
            logger.info(f"📄 Arquivo existente: {self.gastos_file}")

        # Inicializa categorias.csv
        if not os.path.exists(self.categorias_file):
            categorias_padrao = [
                {"categoria": "Mercado", "teto_mensal": 500.00},
                {"categoria": "Lazer", "teto_mensal": 300.00},
                {"categoria": "Transporte", "teto_mensal": 200.00},
                {"categoria": "Restaurante", "teto_mensal": 400.00},
                {"categoria": "Saúde", "teto_mensal": 300.00},
                {"categoria": "Casa", "teto_mensal": 500.00},
                {"categoria": "Educação", "teto_mensal": 300.00},
                {"categoria": "Vestuário", "teto_mensal": 200.00},
                {"categoria": "Outros", "teto_mensal": 200.00}
            ]
            df_categorias = pd.DataFrame(categorias_padrao)
            df_categorias.to_csv(self.categorias_file, index=False, encoding='utf-8')
            logger.info(f"✅ Arquivo criado: {self.categorias_file} com {len(categorias_padrao)} categorias")
        else:
            logger.info(f"📄 Arquivo existente: {self.categorias_file}")

    def registrar_gasto(self, categoria: str, valor: float, conta: str, 
                       data_str: str, descricao: str, pessoa: str) -> bool:
        """
        Registra um novo gasto no CSV.
        """
        try:
            # Converte a data para o formato datetime e extrai mês e ano
            data_obj = datetime.strptime(data_str, '%d/%m')
            ano = datetime.now().year
            data_completa = data_obj.replace(year=ano).strftime('%d/%m/%Y')
            mes = data_obj.month
            
            # Cria o novo registro
            novo_gasto = {
                "data": data_completa,
                "categoria": categoria.capitalize(),
                "valor": valor,
                "conta": conta.capitalize(),
                "descricao": descricao,
                "pessoa": pessoa,
                "mes": mes,
                "ano": ano
            }

            # Lê o CSV existente
            try:
                df = pd.read_csv(self.gastos_file, encoding='utf-8')
            except pd.errors.EmptyDataError:
                # Se o arquivo estiver vazio, cria um DataFrame vazio
                df = pd.DataFrame(columns=[
                    "data", "categoria", "valor", "conta", 
                    "descricao", "pessoa", "mes", "ano"
                ])
            
            # Adiciona o novo gasto usando pd.concat
            df_novo = pd.DataFrame([novo_gasto])
            df = pd.concat([df, df_novo], ignore_index=True)
            
            # Salva de volta no CSV
            df.to_csv(self.gastos_file, index=False, encoding='utf-8')
            
            logger.info(f"✅ Gasto registrado: {categoria} - R$ {valor:.2f} - {pessoa}")
            return True
            
        except ValueError as e:
            logger.error(f"Erro ao registrar gasto (formato inválido): {e}")
            return False
        except Exception as e:
            logger.error(f"Erro inesperado ao registrar gasto: {e}", exc_info=True)
            return False

    def calcular_limite_restante(self, categoria: str, mes: int, ano: int) -> float:
        """
        Calcula o limite restante para uma categoria em um determinado mês/ano.
        """
        try:
            # 1. Lê o teto mensal
            df_categorias = pd.read_csv(self.categorias_file, encoding='utf-8')
            
            # Busca o teto (case-insensitive)
            cat_row = df_categorias[
                df_categorias['categoria'].str.lower() == categoria.lower()
            ]
            
            if cat_row.empty:
                logger.warning(f"Categoria '{categoria}' não encontrada. Retornando 0.0")
                return 0.0
            
            teto_mensal = float(cat_row.iloc[0]['teto_mensal'])
            
            # 2. Lê os gastos
            try:
                df_gastos = pd.read_csv(self.gastos_file, encoding='utf-8')
            except pd.errors.EmptyDataError:
                # Se não há gastos, retorna o teto completo
                return teto_mensal
            
            # Converte colunas para tipos corretos
            df_gastos['mes'] = pd.to_numeric(df_gastos['mes'], errors='coerce')
            df_gastos['ano'] = pd.to_numeric(df_gastos['ano'], errors='coerce')
            df_gastos['valor'] = pd.to_numeric(df_gastos['valor'], errors='coerce')
            
            # Filtra gastos pela categoria, mês e ano (case-insensitive)
            gastos_filtrados = df_gastos[
                (df_gastos['categoria'].str.lower() == categoria.lower()) &
                (df_gastos['mes'] == mes) &
                (df_gastos['ano'] == ano)
            ]
            
            # Soma os gastos
            total_gasto = gastos_filtrados['valor'].sum()
            
            # 3. Calcula limite restante
            limite_restante = teto_mensal - total_gasto
            
            logger.info(f"📊 {categoria}: Teto={teto_mensal:.2f}, Gasto={total_gasto:.2f}, Restante={limite_restante:.2f}")
            
            return limite_restante
            
        except Exception as e:
            logger.error(f"Erro ao calcular limite restante: {e}", exc_info=True)
            return 0.0

    def get_categorias(self) -> list:
        """
        Retorna lista de categorias disponíveis.
        """
        try:
            df = pd.read_csv(self.categorias_file, encoding='utf-8')
            return df['categoria'].tolist()
        except Exception as e:
            logger.error(f"Erro ao ler categorias: {e}")
            return []

    def get_resumo_mes(self, mes: int, ano: int) -> dict:
        """
        Retorna resumo dos gastos do mês.
        """
        try:
            df_gastos = pd.read_csv(self.gastos_file, encoding='utf-8')
            df_gastos['mes'] = pd.to_numeric(df_gastos['mes'], errors='coerce')
            df_gastos['ano'] = pd.to_numeric(df_gastos['ano'], errors='coerce')
            df_gastos['valor'] = pd.to_numeric(df_gastos['valor'], errors='coerce')
            
            # Filtra pelo mês/ano
            gastos_mes = df_gastos[
                (df_gastos['mes'] == mes) & 
                (df_gastos['ano'] == ano)
            ]
            
            if gastos_mes.empty:
                return {"total": 0.0, "por_categoria": {}, "por_pessoa": {}}
            
            return {
                "total": float(gastos_mes['valor'].sum()),
                "por_categoria": gastos_mes.groupby('categoria')['valor'].sum().to_dict(),
                "por_pessoa": gastos_mes.groupby('pessoa')['valor'].sum().to_dict()
            }
            
        except Exception as e:
            logger.error(f"Erro ao gerar resumo: {e}")
            return {"total": 0.0, "por_categoria": {}, "por_pessoa": {}}