import type { ReactNode } from 'react';
import { createContext, useMemo, useState } from 'react';
import type { CosmosWallet } from '@cosmostation/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type CosmosWalletContextProps = {
  children: ReactNode;
};

type CosmosActions = {
  setCosmosWallets: (cosmosWallets: CosmosWallet[]) => void;
  setCurrentWallet: (cosmosWallet: CosmosWallet) => void;
};

type CosmosValues = {
  cosmosWallets: CosmosWallet[];
  currentWallet: CosmosWallet | null;
};

const queryClient = new QueryClient();

export const ReactQueryContext = createContext<QueryClient | undefined>(undefined);

export const CosmosActionsContext = createContext<CosmosActions | null>(null);
export const CosmosValuesContext = createContext<CosmosValues | null>(null);

export default function CosmosWalletContext({ children }: CosmosWalletContextProps) {
  const [cosmosWallets, setCosmosWallets] = useState<CosmosWallet[]>([]);
  const [currentWallet, setCurrentWallet] = useState<CosmosWallet | null>(null);

  const cosmosActions = {
    setCosmosWallets,
    setCurrentWallet,
  };

  const cosmosValues = useMemo(
    () => ({
      cosmosWallets,
      currentWallet,
    }),
    [cosmosWallets, currentWallet]
  );

  return (
    <CosmosActionsContext.Provider value={cosmosActions}>
      <CosmosValuesContext.Provider value={cosmosValues}>
        <QueryClientProvider client={queryClient} context={ReactQueryContext}>
          {children}
        </QueryClientProvider>
      </CosmosValuesContext.Provider>
    </CosmosActionsContext.Provider>
  );
}
