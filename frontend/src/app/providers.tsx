'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';

import '@rainbow-me/rainbowkit/styles.css';

// Get WalletConnect Project ID from environment variable
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '9750ffaf080acacd98ba2c0b3b02a5af';

const wagmiConfig = getDefaultConfig({
  appName: 'NotYourUsualSignal',
  projectId,
  chains: [
    {
      ...arbitrumSepolia,
      iconBackground: '#0A66C2', // Arbitrum blue color
      iconUrl: 'https://arbiscan.io/images/logo.svg', // Arbitrum logo URL
    }
  ],
  initialChain: arbitrumSepolia, // Set Arbitrum Sepolia as the initial chain
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={arbitrumSepolia} // Explicitly set initial chain
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}