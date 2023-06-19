import { useCallback, useEffect, useState } from 'react';
import type { CosmosWallet } from '@cosmostation/wallets';
import { getCosmosWallets } from '@cosmostation/wallets';

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
    setWallets([...getCosmosWallets()]);
  }, []);

  useEffect(() => {
    window.addEventListener('__cosmosWallets', walletHandler);

    return () => {
      window.removeEventListener('__cosmosWallets', walletHandler);
    };
  }, [walletHandler]);

  useEffect(() => {
    const cosmosWallets = getCosmosWallets();
    setWallets(cosmosWallets);

    const savedWalletName = localStorage.getItem('__cosmosWallets');
    const wallet = cosmosWallets.find((w) => w.name === savedWalletName);

    if (wallet) {
      setCurrentWallet(wallet);
    } else {
      localStorage.removeItem('__cosmosWallets');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { wallets, currentWallet, selectWallet };
}
