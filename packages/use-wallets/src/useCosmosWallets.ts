import { useCallback, useEffect, useContext } from 'react';
import { getCosmosWallets } from '@cosmostation/wallets';
import { CosmosActionsContext, CosmosValuesContext } from './CosmosProvider';

export default function useCosmosWallets() {
  const { setCosmosWallets, setCurrentWallet } = useContext(CosmosActionsContext);
  const { cosmosWallets, currentWallet } = useContext(CosmosValuesContext);

  const selectWallet = useCallback(
    (id: string) => {
      const wallet = cosmosWallets.find((w) => w.id === id);

      if (wallet) {
        setCurrentWallet(wallet);
      } else {
        setCurrentWallet(null);
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

  return { cosmosWallets, currentWallet, selectWallet };
}
