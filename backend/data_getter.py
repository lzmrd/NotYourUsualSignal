import requests
import pandas as pd
import time

# Binance API Endpoint
BASE_URL = "https://api.binance.com/api/v3/klines"

def load_data(csv_file):
    """Load data from a CSV file."""
    df = pd.read_csv(csv_file, parse_dates=["timestamp"])
    return df

def get_binance_data(symbol="BTCUSDT", interval="1m", start_time=None, end_time=None, limit=1000):
    """Scarica dati storici dal mercato Binance con paginazione automatica."""
    all_data = []
    last_timestamp = start_time
    
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
            
        response = requests.get(BASE_URL, params=params)
        
        if response.status_code != 200:
            print("Errore API:", response.status_code, response.text)
            break
            
        data = response.json()
        
        if not data:
            print("Nessun dato ricevuto, fine dello storico.")
            break
            
        all_data.extend(data)
        
        # Ultimo timestamp ricevuto
        last_timestamp = data[-1][0] + 1  # +1 per evitare duplicati
        print(f"Scaricate {len(data)} candele fino a {pd.to_datetime(last_timestamp, unit='ms')}")
        
        # Se abbiamo meno di `limit` risultati, significa che non ci sono più dati
        if len(data) < limit:
            break
            
        time.sleep(0.5)  # Per evitare limiti di richiesta su Binance
    
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
    
    return df