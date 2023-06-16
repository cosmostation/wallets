import type { CosmosWallet } from '@cosmostation/wallets';
import { getCosmosWallets } from '@cosmostation/wallets';
import { useCallback, useEffect, useState } from 'react';

export default function useCosmosWallets() {
  const [wallets, setWallets] = useState<CosmosWallet[]>([]);

  const [currentWallet, setCurrentWallet] = useState<CosmosWallet | null>(null);

  const selectWallet = useCallback(
    (name: string) => {
      const wallet = wallets.find((w) => w.name === name);
      if (wallet) {
        setCurrentWallet(wallet);
        localStorage.setItem('__cosmosWallets', name);
      } else {
        setCurrentWallet(null);
        localStorage.removeItem('__cosmosWallets');
      }
    },
    [wallets]
  );

  const walletHandler = useCallback(() => {
    setWallets(getCosmosWallets());
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const savedWalletName = localStorage.getItem('__cosmosWallets');

      setWallets(getCosmosWallets());
      if (savedWalletName) {
        selectWallet(savedWalletName);
      }
    }, 500);

    addEventListener('__cosmosWallets', walletHandler);

    return () => {
      removeEventListener('__cosmosWallets', walletHandler);
    };
  }, [selectWallet, walletHandler]);

  return { wallets, currentWallet, selectWallet };
}
