import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Header from './components/Header'; // Importa il nuovo componente

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NotYourUsualSignal',
  description:
    'AI-powered crypto trading assistant that analyzes market patterns and provides trading recommendations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />  {/* Aggiungi qui l’header */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
