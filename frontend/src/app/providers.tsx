'use client';

import { useState, useEffect } from 'react';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, arbitrum, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Wallet Connect Project ID - you'll need to provide your own
  const projectId = '9750ffaf080acacd98ba2c0b3b02a5af'; // Replace with your actual project ID
  
  const config = getDefaultConfig({
    appName: 'NotYourUsualSignal',
    projectId,
    chains: [mainnet, arbitrum, base],
    ssr: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}