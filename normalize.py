import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# Carichiamo i dati dal CSV
df = pd.read_csv("./binance_data.csv", parse_dates=["timestamp"])

# Normalizziamo i prezzi e il volume con MinMaxScaler
scaler = MinMaxScaler()
df[["open", "high", "low", "close", "volume"]] = scaler.fit_transform(df[["open", "high", "low", "close", "volume"]])

print(df.head())  # Controlliamo i dati normalizzati