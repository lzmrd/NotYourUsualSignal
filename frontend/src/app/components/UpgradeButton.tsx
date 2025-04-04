'use client';

import React, { useState, useEffect } from 'react';
import { useBuyNft } from '../hooks/buyNftHooks';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';

interface UpgradeButtonProps {
  className?: string;
  onSuccess?: () => void;
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({ className = '', onSuccess }) => {
  const { address, isConnected } = useAccount();
  const { 
    mintNft, 
    txHash, 
    isPending, 
    error: mintError 
  } = useBuyNft();
 
  // Monitora la transazione
  const {
    isLoading: isTransactionPending,
    isSuccess: isTransactionSuccess,
    isError: isTransactionError,
    error: transactionError
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Stato per tracciare le fasi della transazione
  const [transactionState, setTransactionState] = useState<'idle' | 'preparing' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gestisce i cambiamenti di stato della transazione
  useEffect(() => {
    if (isPending) {
      setTransactionState('preparing');
    } else if (isTransactionPending) {
      setTransactionState('pending');
    } else if (isTransactionSuccess) {
      setTransactionState('success');
      if (onSuccess) {
        setTimeout(onSuccess, 1000);
      }
    } else if (mintError || isTransactionError) {
      setTransactionState('error');
      setErrorMessage(
        mintError?.message || 
        transactionError?.message || 
        'Transaction failed'
      );
    }
  }, [
    isPending, 
    isTransactionPending, 
    isTransactionSuccess, 
    isTransactionError, 
    mintError, 
    onSuccess
  ]);

  const handleUpgradeClick = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Directly trigger the mint function
      mintNft();
    } catch (err: any) {
      setTransactionState('error');
      setErrorMessage(err.message || 'An unexpected error occurred');
      console.error('Error initiating transaction:', err);
    }
  };

  return (
    <button
      className={`bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded ${className}`}
      onClick={handleUpgradeClick}
      disabled={transactionState !== 'idle'}
    >
      {transactionState === 'idle' 
        ? 'Upgrade to Premium' 
        : transactionState === 'preparing'
        ? 'Waiting for Confirmation...'
        : transactionState === 'pending'
        ? 'Processing...'
        : transactionState === 'success'
        ? 'Upgrade Complete'
        : 'Error Occurred'}
    </button>
  );
};

export default UpgradeButton;