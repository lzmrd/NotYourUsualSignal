import ta
from data_getter import load_data

df=load_data("binance_data.csv")
# Calcoliamo alcuni indicatori tecnici
df["rsi"] = ta.momentum.RSIIndicator(df["close"], window=14).rsi()  # RSI (Relative Strength Index)
df["macd"] = ta.trend.MACD(df["close"]).macd()  # MACD Line
df["macd_signal"] = ta.trend.MACD(df["close"]).macd_signal()  # MACD Signal Line
df["ema_50"] = ta.trend.EMAIndicator(df["close"], window=50).ema_indicator()  # EMA 50 periodi
df["ema_200"] = ta.trend.EMAIndicator(df["close"], window=200).ema_indicator()  # EMA 200 periodi

# Rimuoviamo eventuali righe con NaN (causate da indicatori con finestra iniziale vuota)
df.dropna(inplace=True)

df.to_csv("binance_data_with_indicators.csv", index=False)


print(df.head())  # Controlliamo i dati con gli indicatori aggiunti