'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartLine, FaRobot, FaExchangeAlt, FaHistory, FaCrown, FaWallet } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface AnalysisResult {
  success: boolean;
  current_data?: {
    close: number;
    rsi: number;
    macd: number;
    macd_signal: number;
    ema_50: number;
    ema_200: number;
  };
  similar_patterns?: Array<{
    timestamp: string;
    close: number;
    rsi: number;
    macd: number;
    macd_signal: number;
    ema_50: number;
    ema_200: number;
  }>;
  analysis?: string;
  recommendation?: {
    action: string;
    confidence: number;
  };
  remaining_analyses?: number | string;
  is_premium?: boolean;
  error?: string;
}

interface UserStatus {
  is_premium: boolean;
  remaining_analyses: number | string;
  reset_date?: string;
  message: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showPastPatterns, setShowPastPatterns] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  
  const { address, isConnected } = useAccount();

  // Define the fetchUserStatus function
  // Sostituisci la funzione fetchUserStatus nel tuo file page.tsx
// con questa versione corretta

const fetchUserStatus = async () => {
  if (!isConnected || !address) {
    return;
  }
  
  try {
    // Chiamata diretta al backend Python su porta 8000
    const response = await axios.get(`http://localhost:8000/api/user-status?wallet_address=${address}`);
    
    if (response.data) {
      setUserStatus({
        is_premium: response.data.is_premium || false,
        remaining_analyses: response.data.remaining_analyses || 10,
        reset_date: response.data.reset_date || null,
        message: response.data.message || 'Free tier access'
      });
    }
  } catch (error) {
    console.error('Error fetching user status:', error);
    // Gestione fallback in caso di errore
    setUserStatus({
      is_premium: false,
      remaining_analyses: 10, 
      message: 'Free tier'
    });
  }
};

  // Fetch user status on component mount or when address changes
  useEffect(() => {
    if (isConnected && address) {
      fetchUserStatus();
    }
  }, [isConnected, address]);

  // Sostituisci la funzione runAnalysis nel tuo file page.tsx
// con questa versione corretta

const runAnalysis = async () => {
  if (!isConnected || !address) {
    alert('Please connect your wallet first');
    return;
  }
  
  setIsLoading(true);
  try {
    // Chiamata diretta al backend Python su porta 8000
    const response = await axios.get(`http://localhost:8000/api/analyze?wallet_address=${address}`);
    
    if (response.data.success) {
      setResult(response.data);
      await fetchUserStatus(); // Aggiorna lo stato dopo analisi
    } else {
      // Gestisci esplicitamente gli errori del backend
      setResult({
        success: false,
        error: response.data.error || 'Analysis failed. Please try again.'
      });
    }
  } catch (error) {
    console.error('Error running analysis:', error);
    setResult({
      success: false,
      error: 'Network error or server unavailable. Make sure the backend is running.'
    });
  } finally {
    setIsLoading(false);
  }
};

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'bg-green-500';
      case 'SELL':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            NotYourUsualSignal
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Your AI-powered crypto trading assistant that analyzes market patterns
            and provides trading recommendations.
          </p>
        </header>

        {/* Wallet Connection & Premium Status */}
        <div className="w-full mb-8 flex flex-col md:flex-row justify-between items-center p-4 bg-gray-800 rounded-xl">
          <div className="mb-4 md:mb-0">
            <ConnectButton />
          </div>
          
          {userStatus && (
            <div className="flex items-center">
              {userStatus.is_premium ? (
                <div className="flex items-center text-yellow-400">
                  <FaCrown className="mr-2" />
                  <span>Premium Access</span>
                </div>
              ) : (
                <div className="flex items-center text-blue-400">
                  <span className="mr-2">Free tier: {userStatus.remaining_analyses} analyses left</span>
                  <button 
                    className="ml-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                    onClick={() => window.open('https://arbitrum-sepolia.arbiscan.io/address/0x7102b5937631affcc05c83ff8bd6141ed214a41d', '_blank')}
                  >
                    Upgrade to Premium
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-16 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-16 rounded-xl text-2xl flex items-center justify-center space-x-3 shadow-xl mx-auto w-80 btn-run-analysis"
            onClick={runAnalysis}
            disabled={isLoading || (!userStatus?.is_premium && userStatus?.remaining_analyses === 0)}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <FaRobot className="mr-3 text-xl" />
                <span>Run Analysis</span>
              </>
            )}
          </motion.button>
        </div>

        {(!isConnected || !address) && (
          <div className="bg-gray-800 rounded-xl p-6 mb-8 text-center">
            <FaWallet className="text-4xl mb-4 mx-auto text-yellow-400" />
            <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-300">
              Connect your wallet to access the trading analysis features. 
              Free tier gets you 10 analyses per month - perfect for long-term traders.
            </p>
            <div className="mt-4 p-4 bg-gray-700 rounded-lg text-left">
              <h4 className="font-semibold text-yellow-400 mb-2">Premium Benefits:</h4>
              <ul className="text-gray-300 list-disc pl-5">
                <li>Unlimited analyses - perfect for day traders and scalpers</li>
                <li>Higher priority processing</li>
                <li>Early access to new features</li>
              </ul>
              <p className="mt-4 text-sm text-gray-400">
                Premium access requires ownership of our NFT. 
                <a 
                  href="https://arbitrum-sepolia.arbiscan.io/address/0x7102b5937631affcc05c83ff8bd6141ed214a41d"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 ml-1 hover:underline"
                >
                  View on Arbiscan
                </a>
              </p>
            </div>
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden w-full"
          >
            {result.success ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Current Data */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <FaChartLine className="mr-2 text-blue-400" />
                      Current Market Data
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Close:</span>
                        <span className="text-white font-medium">{result.current_data?.close.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">RSI:</span>
                        <span className="text-white font-medium">{result.current_data?.rsi.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">MACD:</span>
                        <span className="text-white font-medium">{result.current_data?.macd.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">MACD Signal:</span>
                        <span className="text-white font-medium">{result.current_data?.macd_signal.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">EMA 50:</span>
                        <span className="text-white font-medium">{result.current_data?.ema_50.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">EMA 200:</span>
                        <span className="text-white font-medium">{result.current_data?.ema_200.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <FaRobot className="mr-2 text-green-400" />
                      AI Analysis
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">
                      {result.analysis}
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <FaExchangeAlt className="mr-2 text-purple-400" />
                      Trading Recommendation
                    </h3>
                    <div className="flex flex-col items-center">
                      <div className={`${getActionColor(result.recommendation?.action || '')} text-white text-2xl font-bold py-3 px-6 rounded-lg mb-4`}>
                        {result.recommendation?.action}
                      </div>
                      <div className="mb-2">
                        <span className="text-gray-300">Confidence: </span>
                        <span className={`${getConfidenceColor(result.recommendation?.confidence || 0)} font-bold text-lg`}>
                          {((result.recommendation?.confidence || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-4 mt-2">
                        <div
                          className={`${getConfidenceColor(result.recommendation?.confidence || 0).replace('text-', 'bg-')} h-4 rounded-full`}
                          style={{ width: `${(result.recommendation?.confidence || 0) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Status Banner */}
                {result.is_premium === false && (
                  <div className="mb-6 p-4 bg-yellow-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">Free Tier Usage</h4>
                        <p className="text-gray-300">You have {result.remaining_analyses} analyses remaining this month</p>
                      </div>
                      <button 
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                        onClick={() => window.open('https://arbitrum-sepolia.arbiscan.io/address/0x7102b5937631affcc05c83ff8bd6141ed214a41d', '_blank')}
                      >
                        Upgrade to Premium
                      </button>
                    </div>
                  </div>
                )}

                {/* Similar Patterns Section */}
                {result.similar_patterns && result.similar_patterns.length > 0 && (
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-white flex items-center">
                        <FaHistory className="mr-2 text-yellow-400" />
                        Similar Historical Patterns
                      </h3>
                      <button
                        onClick={() => setShowPastPatterns(!showPastPatterns)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {showPastPatterns ? 'Hide' : 'Show'} Patterns
                      </button>
                    </div>

                    {showPastPatterns && (
                      <div className="bg-gray-700 rounded-lg p-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-600">
                          <thead>
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Close</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">RSI</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">MACD</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">MACD Signal</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">EMA 50</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">EMA 200</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-600">
                            {result.similar_patterns.map((pattern, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{pattern.timestamp}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{pattern.close.toFixed(6)}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{pattern.rsi.toFixed(2)}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{pattern.macd.toFixed(6)}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{pattern.macd_signal.toFixed(6)}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{pattern.ema_50.toFixed(6)}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{pattern.ema_200.toFixed(6)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-red-400 mb-4">Analysis Failed</h3>
                <p className="text-gray-300">{result.error}</p>
                
                {/* Show premium upgrade prompt if free tier limit reached */}
                {result.error && result.error.includes("free tier limit") && (
                  <div className="mt-4">
                    <button 
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                      onClick={() => window.open('https://arbitrum-sepolia.arbiscan.io/address/0x7102b5937631affcc05c83ff8bd6141ed214a41d', '_blank')}
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}