# NotYourUsualSignal 🚀📊

## Overview

NotYourUsualSignal is an advanced AI-powered crypto trading assistant that provides intelligent market analysis and trading recommendations using machine learning and technical indicators.

### Key Features

- 🤖 AI-driven market pattern analysis
- 📈 Real-time trading signals for cryptocurrency markets
- 🔍 Advanced technical indicators (RSI, MACD, EMA)
- 💎 Premium NFT-based access model
- 🔒 Secure wallet connection

## Tech Stack

- **Frontend**: Next.js 15.2.4
- **Backend**: Python (FastAPI)
- **Blockchain**: Arbitrum Sepolia
- **State Management**: Wagmi, RainbowKit
- **Machine Learning**: scikit-learn, pandas, NumPy
- **Data Analysis**: FAISS, TA-Lib

## Prerequisites

- Node.js (v20+)
- Python (v3.9+)
- npm or yarn
- Ethereum Wallet (MetaMask, WalletConnect)

## Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/NotYourUsualSignal.git
cd NotYourUsualSignal
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configuration

1. Create a `.env` file in the frontend directory:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

2. Configure your Arbitrum Sepolia contract address in `buyNftHooks.ts`

## Running the Application

### Start Backend

```bash
cd backend
python api_server.py
```

### Start Frontend

```bash
cd frontend
npm run turbo
```

## Premium Access

- Free tier: 10 analyses per month
- Premium access: Unlimited analyses via NFT purchase
- Purchase premium NFT on the Arbitrum Sepolia network

## Smart Contract

- **Network**: Arbitrum Sepolia
- **Contract Address**: `0x7102b5937631affcc05c83ff8bd6141ed214a41d`
- **Standard**: ERC-721

## How It Works

1. Connect your Ethereum wallet
2. Run market analysis
3. Receive AI-generated trading recommendations
4. Upgrade to premium for unlimited access

## Security

- Wallet connection via WalletConnect
- On-chain access control through NFT
- Backend rate limiting
- Secure transaction processing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/yourusername/NotYourUsualSignal](https://github.com/yourusername/NotYourUsualSignal)

---

🌟 Built with ❤️ for the ETHBucharest Hackathon 2025