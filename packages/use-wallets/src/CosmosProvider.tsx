import type { ReactNode } from 'react';
import { createContext, useMemo, useState } from 'react';
import type { CosmosRequestAccountResponse, CosmosWallet } from '@cosmostation/wallets';

type CosmosWalletContextProps = {
  children: ReactNode;
};

type CosmosAccount = CosmosRequestAccountResponse & { chainID: string };

type CosmosActions = {
  setCosmosWallets: (cosmosWallets: CosmosWallet[]) => void;
  setCurrentWallet: (cosmosWallet: CosmosWallet) => void;
  setCurrentAccounts: (cosmosAccounts: CosmosAccount[]) => void;
};

type CosmosValues = {
  cosmosWallets: CosmosWallet[];
  currentWallet: CosmosWallet | null;
  currentAccounts: CosmosAccount[];
};

export const CosmosActionsContext = createContext<CosmosActions | null>(null);
export const CosmosValuesContext = createContext<CosmosValues | null>(null);

export default function CosmosWalletContext({ children }: CosmosWalletContextProps) {
  const [cosmosWallets, setCosmosWallets] = useState<CosmosWallet[]>([]);
  const [currentWallet, setCurrentWallet] = useState<CosmosWallet | null>(null);
  const [currentAccounts, setCurrentAccounts] = useState<CosmosAccount[]>([]);

  const cosmosActions = {
    setCosmosWallets,
    setCurrentWallet,
    setCurrentAccounts,
  };

  const cosmosValues = useMemo(
    () => ({
      cosmosWallets,
      currentWallet,
      currentAccounts,
    }),
    [cosmosWallets, currentAccounts, currentWallet]
  );

  return (
    <CosmosActionsContext.Provider value={cosmosActions}>
      <CosmosValuesContext.Provider value={cosmosValues}>{children}</CosmosValuesContext.Provider>
    </CosmosActionsContext.Provider>
  );
}
