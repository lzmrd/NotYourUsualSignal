import requests
import pandas as pd
import time
import logging

# Configurazione logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Binance API Endpoint
BASE_URL = "https://api.binance.com/api/v3/klines"

def load_data(csv_file):
    """Load data from a CSV file."""
    try:
        df = pd.read_csv(csv_file, parse_dates=["timestamp"])
        logger.info(f"Caricato CSV: {csv_file}. Dimensioni: {df.shape}")
        return df
    except Exception as e:
        logger.error(f"Errore nel caricare {csv_file}: {e}")
        raise

def get_binance_data(symbol="BTCUSDT", interval="1m", start_time=None, end_time=None, limit=1000):
    """Scarica dati storici dal mercato Binance con paginazione automatica."""
    logger.info(f"Scaricamento dati per {symbol} - Intervallo: {interval}")
    
    all_data = []
    last_timestamp = start_time
    
    try:
        while True:
            params = {
                "symbol": symbol,
                "interval": interval,
                "limit": limit
            }
            
            if last_timestamp:
                params["startTime"] = last_timestamp
            if end_time:
                params["endTime"] = end_time
                
            logger.debug(f"Parametri richiesta: {params}")
            
            response = requests.get(BASE_URL, params=params)
            
            if response.status_code != 200:
                logger.error(f"Errore API: {response.status_code} - {response.text}")
                break
                
            data = response.json()
            
            if not data:
                logger.warning("Nessun dato ricevuto, fine dello storico.")
                break
                
            all_data.extend(data)
            
            # Ultimo timestamp ricevuto
            last_timestamp = data[-1][0] + 1  # +1 per evitare duplicati
            logger.info(f"Scaricate {len(data)} candele fino a {pd.to_datetime(last_timestamp, unit='ms')}")
            
            # Se abbiamo meno di `limit` risultati, significa che non ci sono più dati
            if len(data) < limit:
                break
                
            time.sleep(0.5)  # Per evitare limiti di richiesta su Binance
    except Exception as e:
        logger.error(f"Errore nel recupero dati: {e}")
        raise
    
    # Creiamo il DataFrame
    df = pd.DataFrame(all_data, columns=[
        "timestamp", "open", "high", "low", "close", "volume",
        "close_time", "quote_asset_volume", "trades",
        "taker_buy_base_asset_volume", "taker_buy_quote_asset_volume", "ignore"
    ])
    
    # Convertiamo i dati numerici
    numeric_columns = ["open", "high", "low", "close", "volume"]
    df[numeric_columns] = df[numeric_columns].astype(float)
    
    # Convertiamo il timestamp in un formato leggibile
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    
    # Selezioniamo solo le colonne utili
    df = df[["timestamp", "open", "high", "low", "close", "volume"]]
    
    logger.info(f"Dati Binance caricati. Dimensioni: {df.shape}")
    return df