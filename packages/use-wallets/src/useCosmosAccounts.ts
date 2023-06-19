import useCosmosWallets from './useCosmosWallets';
import { useEffect, useState } from 'react';
import type { CosmosRequestAccountResponse } from '@cosmostation/wallets';

export default function useCosmosAccounts(chainIDs: string[]) {
  const { currentWallet } = useCosmosWallets();

  const [accounts, setAccounts] = useState<CosmosRequestAccountResponse[]>([]);

  useEffect(() => {
    if (currentWallet) {
      (async () => {
        const supportedChainIDs = await currentWallet.methods.getSupportedChainIDs();

        const requestChainIDs = chainIDs.filter((chainID) => supportedChainIDs.includes(chainID));
        const accounts =
          requestChainIDs.length > 0
            ? await Promise.all(requestChainIDs.map((chainID) => currentWallet.methods.requestAccount(chainID)))
            : [];

        setAccounts(accounts);
      })();
    }
  }, [chainIDs, currentWallet]);

  return { accounts };
}
