import numpy as np
from data_getter import load_data

df = load_data("binance_data_with_indicators.csv")
# Selezioniamo solo le colonne utili per il machine learning
features = ["close", "rsi", "macd", "macd_signal", "ema_50", "ema_200"]
data_vectors = df[features].values  # Convertiamo in array numpy

df.to_csv("binance_data.csv", index=False)  # Sovrascrive il CSV con i dati finali
print("Dati finali salvati su binance_data.csv")
print("Esempio di vettore:", data_vectors[0])