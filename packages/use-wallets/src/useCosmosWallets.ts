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

  const closeWallet = useCallback(() => {
    currentWallet?.methods?.disconnect?.();
    setCurrentWallet(null);
  }, [currentWallet?.methods, setCurrentWallet]);

  const addChain = useCallback((chain) => currentWallet?.methods?.addChain?.(chain), [currentWallet?.methods]);

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
    window.dispatchEvent(new CustomEvent('__cosmosWallets'));
  }, []);

  return { cosmosWallets, currentWallet, selectWallet, closeWallet, addChain };
}
