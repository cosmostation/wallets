import { useCallback, useEffect, useContext } from 'react';
import { getCosmosWallets } from '@cosmostation/wallets';
import { CosmosActionsContext, CosmosValuesContext } from './CosmosProvider';

export default function useCosmosWallets() {
  const { setCosmosWallets, setCurrentWallet } = useContext(CosmosActionsContext);
  const { cosmosWallets, currentWallet } = useContext(CosmosValuesContext);

  const selectWallet = useCallback(
    (name: string) => {
      const wallet = cosmosWallets.find((w) => w.name === name);

      if (wallet) {
        setCurrentWallet(wallet);
        localStorage.setItem('__cosmosWallets', name);
      } else {
        setCurrentWallet(null);
        localStorage.removeItem('__cosmosWallets');
      }
    },
    [cosmosWallets, setCurrentWallet]
  );

  const walletHandler = useCallback(() => {
    setCosmosWallets([...getCosmosWallets()]);
  }, [setCosmosWallets]);

  useEffect(() => {
    window.addEventListener('__cosmosWallets', walletHandler);

    return () => {
      window.removeEventListener('__cosmosWallets', walletHandler);
    };
  }, [walletHandler]);

  useEffect(() => {
    const wallets = getCosmosWallets();
    setCosmosWallets(wallets);

    const savedWalletName = localStorage.getItem('__cosmosWallets');
    const wallet = cosmosWallets.find((w) => w.name === savedWalletName);

    if (wallet) {
      setCurrentWallet(wallet);
    } else {
      localStorage.removeItem('__cosmosWallets');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { cosmosWallets, currentWallet, selectWallet };
}
