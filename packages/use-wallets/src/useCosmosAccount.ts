import { CosmosRequestAccountResponse } from '@cosmostation/wallets';
import { useCallback, useEffect, useState } from 'react';
import useCosmosWallets from './useCosmosWallets';

export default function useCosmosAccount(chainId: string) {
  const { currentWallet } = useCosmosWallets();

  const [account, setAccount] = useState<CosmosRequestAccountResponse | undefined>();
  const [error, setError] = useState<string | undefined>();

  const requestAccount = useCallback(async () => {
    try {
      if (currentWallet) {
        const supportedChainIDs = await currentWallet.methods.getSupportedChainIds();
        const responseAccount = supportedChainIDs.includes(chainId)
          ? await currentWallet.methods.requestAccount(chainId)
          : undefined;

        setAccount(responseAccount);
        setError(undefined);
      } else {
        setAccount(undefined);
        setError('No wallet selected');
      }
    } catch (e) {
      setAccount(undefined);
      setError(e.message);
    }
  }, [chainId, currentWallet]);

  useEffect(() => {
    requestAccount();
  }, [requestAccount]);

  return { data: account, error, mutate: requestAccount };
}
