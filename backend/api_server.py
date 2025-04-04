from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from web3 import Web3
import json
import pandas as pd
import logging
import traceback
from datetime import datetime, timedelta
from typing import Dict, Any

# Configurazione logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Importa i moduli esistenti
try:
    from analyzer import (
        update_data, 
        create_faiss_index, 
        find_similar_patterns, 
        generate_prompt, 
        analyze_with_model, 
        make_trading_decision
    )
except Exception as e:
    logger.error(f"Errore nell'importazione dei moduli: {e}")
    logger.error(traceback.format_exc())
    raise

app = FastAPI()

# Aggiungi CORS middleware

# Verifica che questa parte del tuo backend abbia le origins corrette
# In api_server.py assicurati che il CORS middleware sia configurato così:

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Porta su cui gira Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Converti l'indirizzo in formato checksum
CONTRACT_ADDRESS = Web3.to_checksum_address('0x7102b5937631affcc05c83ff8bd6141ed214a41d')

# Aggiungi l'ABI completa del contratto
CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "to", "type": "address"}
        ],
        "name": "mintTo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "owner", "type": "address"}
        ],
        "name": "balanceOf",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

# Inizializza Web3 con l'RPC corretto per Arbitrum
w3 = Web3(Web3.HTTPProvider('https://sepolia-rollup.arbitrum.io/rpc'))
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

# Dizionario per tenere traccia delle analisi degli utenti
# Chiave: indirizzo wallet, Valore: {count: numero di analisi, last_reset: data ultimo reset}
user_analytics: Dict[str, Dict[str, Any]] = {}

def user_has_reached_free_limit(wallet_address: str) -> bool:
    """Controlla se l'utente ha raggiunto il limite gratuito di analisi."""
    # Converti l'indirizzo in formato checksum
    wallet_address = Web3.to_checksum_address(wallet_address)
    
    # Inizializza i dati dell'utente se non esistono
    if wallet_address not in user_analytics:
        user_analytics[wallet_address] = {"count": 0, "last_reset": datetime.now()}
        return False
    
    # Controlla se è tempo di resettare il contatore (es. ogni mese)
    last_reset = user_analytics[wallet_address]["last_reset"]
    if (datetime.now() - last_reset).days >= 30:  # Reset mensile
        user_analytics[wallet_address] = {"count": 0, "last_reset": datetime.now()}
        return False
    
    # Verifica se l'utente ha superato il limite gratuito
    return user_analytics[wallet_address]["count"] >= 10  # 10 analisi gratuite al mese

def get_remaining_analyses(wallet_address: str) -> int:
    """Ottiene il numero di analisi rimanenti per l'utente."""
    # Converti l'indirizzo in formato checksum
    wallet_address = Web3.to_checksum_address(wallet_address)
    
    # Controlla se l'utente è premium
    nft_balance = contract.functions.balanceOf(wallet_address).call()
    if nft_balance > 0:
        return "Unlimited"
    
    # Inizializza i dati dell'utente se non esistono
    if wallet_address not in user_analytics:
        user_analytics[wallet_address] = {"count": 0, "last_reset": datetime.now()}
    
    # Controlla se è tempo di resettare il contatore
    last_reset = user_analytics[wallet_address]["last_reset"]
    if (datetime.now() - last_reset).days >= 30:  # Reset mensile
        user_analytics[wallet_address] = {"count": 0, "last_reset": datetime.now()}
    
    # Calcola le analisi rimanenti
    return 10 - user_analytics[wallet_address]["count"]

def increment_user_analysis_count(wallet_address: str) -> None:
    """Incrementa il contatore delle analisi per l'utente."""
    # Converti l'indirizzo in formato checksum
    wallet_address = Web3.to_checksum_address(wallet_address)
    
    # Inizializza i dati dell'utente se non esistono
    if wallet_address not in user_analytics:
        user_analytics[wallet_address] = {"count": 0, "last_reset": datetime.now()}
    
    # Incrementa il contatore
    user_analytics[wallet_address]["count"] += 1

@app.get("/api/user-status")
async def get_user_status(wallet_address: str):
    try:
        # Converti l'indirizzo in formato checksum
        wallet_address = Web3.to_checksum_address(wallet_address)
        
        # Verifica il possesso dell'NFT
        nft_balance = contract.functions.balanceOf(wallet_address).call()
        is_premium = nft_balance > 0
        
        # Calcola analisi rimanenti e data di reset
        remaining = get_remaining_analyses(wallet_address)
        
        # Calcola la data di reset solo per gli utenti non premium
        reset_date = None
        if not is_premium and wallet_address in user_analytics:
            last_reset = user_analytics[wallet_address]["last_reset"]
            reset_date = (last_reset + timedelta(days=30)).strftime("%Y-%m-%d")
        
        return {
            "is_premium": is_premium,
            "remaining_analyses": remaining,
            "reset_date": reset_date,
            "message": "Premium access" if is_premium else "Free tier access"
        }
    except Exception as e:
        logger.error(f"Errore nel recupero dello stato utente: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/analyze")
async def analyze(wallet_address: str):
    """
    Esegue l'analisi di trading basata sui pattern di mercato.
    """
    try:
        # Converti l'indirizzo in formato checksum
        wallet_address = Web3.to_checksum_address(wallet_address)
        
        # Verifica lo stato premium
        nft_balance = contract.functions.balanceOf(wallet_address).call()
        is_premium = nft_balance > 0
        
        # Controlla il limite per utenti non premium
        if not is_premium and user_has_reached_free_limit(wallet_address):
            return {
                "success": False, 
                "error": "Free tier limit reached. Upgrade to continue.",
                "is_premium": False,
                "remaining_analyses": 0
            }
        
        logger.debug("Inizio procedura di analisi")
        
        # Codice di analisi esistente con log dettagliati
        logger.debug("Caricamento e aggiornamento dati")
        df, data_vectors = update_data()
        logger.debug(f"Dati caricati: {df.shape}")
        
        logger.debug("Creazione indice FAISS")
        create_faiss_index(data_vectors)
        
        logger.debug("Ricerca pattern simili")
        last_vector, similar_patterns = find_similar_patterns(data_vectors)
        
        if last_vector is not None:
            logger.debug("Generazione prompt")
            prompt = generate_prompt(last_vector, similar_patterns)
            
            logger.debug("Analisi con modello")
            analysis = analyze_with_model(prompt)
            
            logger.debug("Decisione di trading")
            action, confidence = make_trading_decision(analysis)
            
            # Incrementa il contatore per utenti non premium
            if not is_premium:
                increment_user_analysis_count(wallet_address)
            
            # Conversione dei dati come prima
            similar_patterns_dict = similar_patterns.to_dict('records') if similar_patterns is not None else None
            
            if similar_patterns_dict:
                for item in similar_patterns_dict:
                    if isinstance(item.get('timestamp'), pd.Timestamp):
                        item['timestamp'] = item['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
            
            return {
                "success": True,
                "is_premium": is_premium,
                "remaining_analyses": get_remaining_analyses(wallet_address),
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
            logger.warning("Nessun pattern riconosciuto")
            return {
                "success": False,
                "error": "No pattern recognition possible yet. Need more data."
            }
    except Exception as e:
        logger.error(f"Errore durante l'analisi: {e}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)