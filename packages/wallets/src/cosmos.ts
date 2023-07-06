declare global {
  interface Window {
    __cosmosWallets: CosmosWallet[];
  }
}

export type CosmosPublicKeyType = 'secp256k1' | 'ethsecp256k1';

export interface CosmosSignAminoDoc {
  chain_id: string;
  sequence: string;
  account_number: string;
  fee: {
    amount?: { denom: string; amount: string }[];
    gas: string;
  };
  memo: string;
  msgs: { type: string; value: any }[];
}

export interface CosmosSignDirectDoc {
  chain_id: string;
  account_number: string;
  body_bytes: Uint8Array;
  auth_info_bytes: Uint8Array;
}

export interface CosmosRequestAccountResponse {
  address: string;
  publicKey: {
    type: CosmosPublicKeyType;
    value: string;
  };
  name?: string;
  isLedger?: boolean;
}

export interface CosmosSignAminoResponse {
  publicKey: {
    type: CosmosPublicKeyType;
    value: string;
  };
  signature: string;
  signedDoc: any;
}

export interface CosmosSignDirectResponse {
  publicKey: {
    type: CosmosPublicKeyType;
    value: string;
  };
  signature: string;
  signedDoc: any;
}

export interface CosmosSendTransactionResponse {
  tx_response: {
    code: number;
    txhash: string;
    raw_log?: unknown;
    codespace?: unknown;
    tx?: unknown;
    log?: unknown;
    info?: unknown;
    height?: unknown;
    gas_wanted?: unknown;
    gas_used?: unknown;
    events?: unknown;
    data?: unknown;
    timestamp?: unknown;
  };
}

export interface CosmosSignMessageResponse {
  publicKey: {
    type: CosmosPublicKeyType;
    value: string;
  };
  signature: string;
}

type CosmosEventTypes = {
  AccountChanged: () => void;
};

type CosmosEventTypeKeys = keyof CosmosEventTypes;

export interface CosmosMethods {
  requestAccount: (chainId: string) => Promise<CosmosRequestAccountResponse>;

  signAmino: (
    chainId: string,
    document: CosmosSignAminoDoc,
    options?: { signer?: string; editMode?: { fee?: boolean; memo?: boolean } }
  ) => Promise<CosmosSignAminoResponse>;
  signDirect: (
    chainId: string,
    document: CosmosSignDirectDoc,
    options?: { signer?: string; editMode?: { fee?: boolean; memo?: boolean } }
  ) => Promise<CosmosSignDirectResponse>;
  getSupportedChainIds: () => Promise<string[]>;
  signMessage?: (chainId: string, message: string, signer: string) => Promise<CosmosSignMessageResponse>;
  verifyMessage?: (
    chainId: string,
    message: string,
    signer: string,
    signature: string,
    publicKey: string
  ) => Promise<boolean>;
  sendTransaction?: (
    chainId: string,
    txBytes: Uint8Array | string,
    mode?: number
  ) => Promise<CosmosSendTransactionResponse>;
}

export interface CosmosEvents {
  on: <T extends CosmosEventTypeKeys>(type: T, listener: CosmosEventTypes[T]) => void;
  off: <T extends CosmosEventTypeKeys>(type: T, listener: CosmosEventTypes[T]) => void;
}

export interface CosmosWallet {
  id: string;
  name: string;
  logo: string;
  methods: CosmosMethods;
  events: CosmosEvents;
}

export type RegistCosmosWallet = Omit<CosmosWallet, 'id'>;

export const registCosmosWallet = (wallet: RegistCosmosWallet) => {
  if (window.__cosmosWallets == undefined) {
    window.__cosmosWallets = [];
  }

  if (!wallet?.name || !wallet?.logo) {
    return;
  }

  if (!window.__cosmosWallets.some((w) => w.name === wallet.name)) {
    window.__cosmosWallets.push({ id: crypto.randomUUID(), ...wallet });
    window.dispatchEvent(new CustomEvent('__cosmosWallets'));
  }
};

export const getCosmosWallets = () => window.__cosmosWallets || [];
