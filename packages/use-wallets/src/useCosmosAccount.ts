import { CosmosRequestAccountResponse } from '@cosmostation/wallets';
import { useCallback, useEffect, useState } from 'react';
import useCosmosWallets from './useCosmosWallets';

export default function useCosmosAccount(chainId: string) {
  const { currentWallet } = useCosmosWallets();

  const [account, setAccount] = useState<CosmosRequestAccountResponse>();

  const requestAccount = useCallback(async () => {
    try {
      if (currentWallet) {
        const supportedChainIDs = await currentWallet.methods.getSupportedChainIDs();
        const responseAccount = supportedChainIDs.includes(chainId)
          ? await currentWallet.methods.requestAccount(chainId)
          : undefined;

        setAccount(responseAccount);
      } else {
        setAccount(undefined);
      }
    } catch {
      setAccount(undefined);
    }
  }, [chainId, currentWallet]);

  useEffect(() => {
    requestAccount();
  }, [requestAccount]);

  return { account, reRequest: requestAccount };
}
