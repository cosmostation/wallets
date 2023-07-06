import { CosmosRequestAccountResponse } from '@cosmostation/wallets';
import { useCallback, useEffect, useState } from 'react';
import useCosmosWallets from './useCosmosWallets';

export default function useCosmosAccount(chainID: string) {
  const { currentWallet } = useCosmosWallets();

  const [account, setAccount] = useState<CosmosRequestAccountResponse>();

  const requestAccount = useCallback(async () => {
    if (currentWallet) {
      const supportedChainIDs = await currentWallet.methods.getSupportedChainIDs();
      const responseAccount = supportedChainIDs.includes(chainID)
        ? await currentWallet.methods.requestAccount(chainID)
        : undefined;

      setAccount(responseAccount);
    } else {
      setAccount(undefined);
    }
  }, [chainID, currentWallet]);

  useEffect(() => {
    requestAccount();
  }, [requestAccount]);

  return { account, reRequest: requestAccount };
}
