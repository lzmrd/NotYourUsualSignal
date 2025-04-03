import faiss
import numpy as np
import pandas as pd
import time
import os

from data_getter import get_binance_data, load_data
from normalize import scaler
import ta

def update_data():
    """Scarica, normalizza, calcola gli indicatori e crea i vettori di dati."""
    print("🔄 Scaricando dati storici da Binance...")
    DAYS = 3
    end_time = int(time.time() * 1000)
    start_time = end_time - (DAYS * 24 * 60 * 60 * 1000)
    df = get_binance_data(symbol="BTCUSDT", interval="1m", start_time=start_time, end_time=end_time)
    
    df.to_csv("binance_data.csv", index=False)
    df = pd.read_csv("binance_data.csv", parse_dates=["timestamp"])
    df[["open", "high", "low", "close", "volume"]] = scaler.fit_transform(df[["open", "high", "low", "close", "volume"]])
    
    df["rsi"] = ta.momentum.RSIIndicator(df["close"], window=14).rsi()
    df["macd"] = ta.trend.MACD(df["close"]).macd()
    df["macd_signal"] = ta.trend.MACD(df["close"]).macd_signal()
    df["ema_50"] = ta.trend.EMAIndicator(df["close"], window=50).ema_indicator()
    df["ema_200"] = ta.trend.EMAIndicator(df["close"], window=200).ema_indicator()
    df.dropna(inplace=True)
    
    df.to_csv("binance_data_with_indicators.csv", index=False)
    features = ["close", "rsi", "macd", "macd_signal", "ema_50", "ema_200"]
    data_vectors = df[features].values.astype(np.float32)
    
    # Make sure the array is C-contiguous
    data_vectors = np.ascontiguousarray(data_vectors)
    
    return df, data_vectors

def create_faiss_index(data_vectors):
    """Crea o aggiorna l'indice FAISS."""
    index = faiss.IndexFlatL2(data_vectors.shape[1])
    index.add(data_vectors)
    faiss.write_index(index, "faiss_index.bin")
    return index

def find_similar_patterns(data_vectors, num_neighbors=5):
    """Trova i pattern più simili usando FAISS."""
    if not os.path.exists("faiss_index.bin"):
        return None, None
    
    index = faiss.read_index("faiss_index.bin")
    last_vector = data_vectors[-1].reshape(1, -1)
    # Make sure the last vector is C-contiguous
    last_vector = np.ascontiguousarray(last_vector)
    
    distances, indices = index.search(last_vector, num_neighbors)
    
    df = pd.read_csv("binance_data_with_indicators.csv")
    valid_indices = [i for i in indices[0] if i >= 0 and i < len(df)]
    return last_vector, df.iloc[valid_indices] if valid_indices else None

def generate_prompt(last_vector, similar_patterns):
    if similar_patterns is None:
        return "No similar patterns found."
    
    prompt = f"""
    We have identified a current market setup that matches historical patterns.

    📊 **Current Data:**
    - Close: {last_vector[0][0]}
    - RSI: {last_vector[0][1]}
    - MACD: {last_vector[0][2]}
    - MACD Signal: {last_vector[0][3]}
    - EMA 50: {last_vector[0][4]}
    - EMA 200: {last_vector[0][5]}

    📊 **Similar Historical Patterns (past occurrences of similar setups)**:
    {similar_patterns.to_string(index=False)}

    🧠 **Analysis Requested:**
    1️⃣ **Comparison Table:**  
    - Compare current setup with historical patterns for Close, RSI, MACD, and EMAs.  

    2️⃣ **Market Movement Analysis (Next 5, 10, 15 minutes):**  
    - For each historical pattern, analyze price movements after detection.
    - Identify recurring trends.  

    3️⃣ **Prediction Based on Past Data:**  
    - Predict potential outcomes for the current setup with confidence levels.
    """

    return prompt

def analyze_with_model(prompt):
    """Simple analysis - in a real setup, you might use an LLM."""
    analysis = "Analysis based on historical patterns:\n"
    analysis += "- Similar patterns suggest a potential upward movement in the next 5-15 minutes.\n"
    analysis += "- RSI indicates moderate momentum.\n"
    analysis += "- MACD crossover pattern detected.\n"
    return analysis

def make_trading_decision(analysis, threshold=0.7):
    """Make a trading decision based on the analysis."""
    # This is a placeholder for your actual trading logic
    if "upward movement" in analysis and "MACD crossover" in analysis:
        confidence = 0.8
        if confidence > threshold:
            return "BUY", confidence
    
    return "HOLD", 0.5

if __name__ == "__main__":
    df, data_vectors = update_data()
    create_faiss_index(data_vectors)
    last_vector, similar_patterns = find_similar_patterns(data_vectors)
    
    if last_vector is not None:
        prompt = generate_prompt(last_vector, similar_patterns)
        print("\n===== Analysis Prompt =====\n", prompt)
        
        analysis = analyze_with_model(prompt)
        print("\n===== Analysis =====\n", analysis)
        
        action, confidence = make_trading_decision(analysis)
        print(f"\n===== Trading Decision =====\nAction: {action} (Confidence: {confidence:.2f})")
    else:
        print("No pattern recognition possible yet. Need more data.")