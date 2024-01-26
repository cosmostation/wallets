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
  body_bytes: string | Uint8Array; // hex string or Uint8Array
  auth_info_bytes: string | Uint8Array; // hex string or Uint8Array
}

export interface CosmosRequestAccountResponse {
  address: string;
  public_key: {
    type: CosmosPublicKeyType;
    value: string;
  };
  name?: string;
  is_ledger?: boolean;
}

export interface CosmosSignAminoResponse {
  signature: string;
  signed_doc: any;
}

export interface CosmosSignedDoc {
  auth_info_bytes: Uint8Array;
  body_bytes: Uint8Array;
}
export interface CosmosSignDirectResponse {
  signature: string;
  signed_doc: CosmosSignedDoc;
}

export interface CosmosSignMessageResponse {
  signature: string;
}

export interface CosmosSignOptions {
  signer?: string;
  edit_mode?: { fee?: boolean; memo?: boolean };
  is_check_balance?: boolean;
}

export interface CosmosGasRate {
  tiny: string;
  low: string;
  average: string;
}

export interface CosmosAddChain {
  chain_id: string;
  chain_name: string;
  lcd_url: string;
  base_denom: string;
  display_denom: string;
  address_prefix: string;
  type?: '' | 'ETHERMINT';
  image_url?: string;
  decimals?: number;
  coin_type?: string;
  coingecko_id?: string;
  gas_rate?: CosmosGasRate;
  cosmwasm?: boolean;
}

type CosmosEventTypes = {
  AccountChanged: () => void;
};

type CosmosEventTypeKeys = keyof CosmosEventTypes;

export interface CosmosMethods {
  connect: (chainIds: string | string[]) => Promise<void>;
  getAccount: (chainId: string) => Promise<CosmosRequestAccountResponse>;
  signAmino: (
    chain_id: string,
    document: CosmosSignAminoDoc,
    options?: CosmosSignOptions
  ) => Promise<CosmosSignAminoResponse>;
  signDirect: (
    chain_id: string,
    document: CosmosSignDirectDoc,
    options?: CosmosSignOptions
  ) => Promise<CosmosSignDirectResponse>;
  sendTransaction: (chain_id: string, tx_bytes: Uint8Array | string, mode?: number) => Promise<string>;
  signMessage?: (chainId: string, message: string, signer: string) => Promise<CosmosSignMessageResponse>;
  verifyMessage?: (
    chain_id: string,
    message: string,
    signer: string,
    signature: string,
    public_key: string
  ) => Promise<boolean>;
  disconnect?: () => Promise<void>;
  addChain?: (chain: CosmosAddChain) => Promise<void>;
  getSupportedChainIds: () => Promise<string[]>;
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

export type CosmosRegisterWallet = Omit<CosmosWallet, 'id'>;

export interface CosmosAmount {
  denom: string;
  amount: number;
}

export interface CosmosFee {
  amount: CosmosAmount[];
  gas_limit: number;
  payer?: string;
  granter?: string;
}

export interface CosmosProtoMessage {
  type_url: string;
  value?: unknown;
}

export interface CosmosPublicKey {
  type_url?: string;
  key: string;
}

export interface CosmosProto {
  chain_id: string;
  signer: string;
  public_key: CosmosPublicKey;
  messages: CosmosProtoMessage[];
  memo?: string;
  fee?: CosmosFee;
  sequence?: number;
  lcd_url?: string;
  fee_denom?: string;
  gas_rate?: number;
  payer?: string;
  granter?: string;
  gas_coefficient?: number;
}

export interface CosmosProtoResponse {
  auth_info_bytes: Uint8Array;
  body_bytes: Uint8Array;
  chain_id: string;
  account_number: string;
}

export interface CosmosProtoBytes {
  auth_info_bytes: string | Uint8Array;
  body_bytes: string | Uint8Array;

  signature: string;
}

export type CosmosProtoBytesResponse = string;

export const registerCosmosWallet = (wallet: CosmosRegisterWallet) => {
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

export const getCosmosTxProto = async (params: CosmosProto): Promise<CosmosProtoResponse> => {
  const postResponse = await fetch('https://proto.mintscan.io/proto', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!postResponse.ok) {
    const error = await postResponse.json();
    throw new Error(Array.isArray(error.message) ? error.message.join('\n') : error.message);
  }

  const response = await postResponse.json();

  const auth_info_bytes = toUint8Array(response.auth_info_bytes);
  const body_bytes = toUint8Array(response.body_bytes);

  return { ...response, auth_info_bytes, body_bytes };
};

export const getCosmosTxProtoBytes = async (params: CosmosProtoBytes): Promise<CosmosProtoBytesResponse> => {
  const auth_info_bytes =
    typeof params.auth_info_bytes === 'string' ? params.auth_info_bytes : toHexString(params.auth_info_bytes);

  const body_bytes = typeof params.body_bytes === 'string' ? params.body_bytes : toHexString(params.body_bytes);

  const postResponse = await fetch('https://proto.mintscan.io/proto/bytes', {
    method: 'POST',
    body: JSON.stringify({ ...params, auth_info_bytes, body_bytes }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!postResponse.ok) {
    const error = await postResponse.json();
    throw new Error(Array.isArray(error.message) ? error.message.join('\n') : error.message);
  }

  const response = await postResponse.text();

  return response;
};

export const toUint8Array = (hexString: string) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

export const toHexString = (bytes: Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export const getCosmosPublicKeyTypeURL = (type: string) => {
  switch (type) {
    case 'secp256k1':
      return '/cosmos.crypto.secp256k1.PublicKey';
    case 'ethsecp256k1':
      return '/ethermint.crypto.v1.ethsecp256k1.PublicKey';
    default:
      return type;
  }
};
