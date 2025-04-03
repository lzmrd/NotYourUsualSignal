# NotYourUsualSignal

AI-powered crypto trading assistant for EthBucharest hackathon.

## RainbowKit Wallet Integration

This project uses RainbowKit for wallet connection. Follow these steps to set it up:

### 1. Get a WalletConnect Project ID

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID

### 2. Update the providers.tsx file

Open `frontend/src/app/providers.tsx` and replace "YOUR_PROJECT_ID" with your actual Project ID:

```typescript
const config = getDefaultConfig({
  appName: 'NotYourUsualSignal',
  projectId: 'YOUR_ACTUAL_PROJECT_ID', // Replace this
  chains: [mainnet, arbitrum, base],
  ssr: true,
});
```

### 3. Start the development server

```bash
# Start the backend
cd /path/to/your/project
python api_server.py

# In a separate terminal, start the frontend
cd /path/to/your/project/frontend
npm run dev
```

## Features

- AI-powered market analysis
- Pattern recognition using FAISS
- Real-time crypto market data
- Web3 wallet integration
- Trading recommendations with confidence scores
