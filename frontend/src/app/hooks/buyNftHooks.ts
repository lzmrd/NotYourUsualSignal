import { useWriteContract, useSimulateContract } from 'wagmi';
import { parseEther } from 'viem';

// Costanti dello smart contract
const NFT_CONTRACT_ADDRESS = '0x7102b5937631affcc05c83ff8bd6141ed214a41d';
const NFT_CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const useBuyNft = () => {
  const { 
    data: simulateData, 
    error: simulateError 
  } = useSimulateContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFT_CONTRACT_ABI,
    functionName: 'mint',
  });

  const { 
    writeContract, 
    data: txHash, 
    error: writeError, 
    isPending 
  } = useWriteContract();

  const mintNft = () => {
    if (simulateData) {
      writeContract(simulateData.request);
    }
  };

  return {
    mintNft,
    txHash,
    isPending,
    error: simulateError || writeError
  };
};