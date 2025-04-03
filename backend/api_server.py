from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from analyzer import update_data, create_faiss_index, find_similar_patterns, generate_prompt, analyze_with_model, make_trading_decision
import pandas as pd

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/api/analyze")
async def analyze():
    try:
        # Run the analysis
        df, data_vectors = update_data()
        create_faiss_index(data_vectors)
        last_vector, similar_patterns = find_similar_patterns(data_vectors)
        
        if last_vector is not None:
            prompt = generate_prompt(last_vector, similar_patterns)
            analysis = analyze_with_model(prompt)
            action, confidence = make_trading_decision(analysis)
            
            # Convert similar_patterns to a dictionary
            similar_patterns_dict = similar_patterns.to_dict('records') if similar_patterns is not None else None
            
            # Convert timestamp to string to make it JSON serializable
            if similar_patterns_dict:
                for item in similar_patterns_dict:
                    if isinstance(item.get('timestamp'), pd.Timestamp):
                        item['timestamp'] = item['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
            
            return {
                "success": True,
                "current_data": {
                    "close": float(last_vector[0][0]),
                    "rsi": float(last_vector[0][1]),
                    "macd": float(last_vector[0][2]),
                    "macd_signal": float(last_vector[0][3]),
                    "ema_50": float(last_vector[0][4]),
                    "ema_200": float(last_vector[0][5])
                },
                "similar_patterns": similar_patterns_dict,
                "analysis": analysis,
                "recommendation": {
                    "action": action,
                    "confidence": confidence
                }
            }
        else:
            return {
                "success": False,
                "error": "No pattern recognition possible yet. Need more data."
            }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)
