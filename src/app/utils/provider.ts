import { BrowserProvider, Eip1193Provider } from 'ethers';

export function createNoENSProvider(ethereum: Eip1193Provider): BrowserProvider {
  return new BrowserProvider(
    ethereum,
    {
      name: 'sepolia',
      chainId: 11155111,
      ensAddress: undefined // Disable ENS
    }
  );
}