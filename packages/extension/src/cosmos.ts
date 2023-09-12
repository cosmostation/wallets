declare global {
  interface Window {
    cosmostation: any;
  }
}

import {
  CosmosSignAminoDoc,
  CosmosSignDirectDoc,
  CosmosRequestAccountResponse,
  CosmosSignOptions,
  CosmosSignDirectResponse,
  CosmosSignAminoResponse,
  CosmosSendTransactionResponse,
  toUint8Array,
  CosmosProto,
  getCosmosTxProto,
  getCosmosTxProtoBytes,
  CosmosSignMessageResponse,
} from '@cosmostation/wallets';

type CosmosType = '' | 'ETHERMINT';

type GasRate = {
  tiny: string;
  low: string;
  average: string;
};

export type CosAddChainParams = {
  type?: CosmosType;
  chainId: string;
  chainName: string;
  restURL: string;
  imageURL?: string;
  baseDenom: string;
  displayDenom: string;
  decimals?: number;
  coinType?: string;
  addressPrefix: string;
  coinGeckoId?: string;
  gasRate?: GasRate;
  sendGas?: string;
  cosmWasm?: boolean;
};

export type CosmosSignAndSendTransactionProps = Omit<CosmosProto, 'chain_id' | 'signer' | 'public_key'>;

type CosmosEventTypes = {
  AccountChanged: () => void;
};

type CosmosEventTypeKeys = keyof CosmosEventTypes;

type Cosmos = {
  requestAccount: () => Promise<CosmosRequestAccountResponse>;
  signAmino: (document: CosmosSignAminoDoc, options?: CosmosSignOptions) => Promise<CosmosSignAminoResponse>;
  signDirect: (document: CosmosSignDirectDoc, options?: CosmosSignOptions) => Promise<CosmosSignDirectResponse>;
  sendTransaction: (txBytes: string, mode?: number) => Promise<CosmosSendTransactionResponse>;
  signAndSendTransaction: (
    props: CosmosSignAndSendTransactionProps,
    options?: CosmosSignOptions
  ) => Promise<CosmosSendTransactionResponse>;
};

export function on<T extends CosmosEventTypeKeys>(type: T, listener: CosmosEventTypes[T]) {
  if (type === 'AccountChanged') {
    window.addEventListener('cosmostation_keystorechange', listener);
  }
}

export function off<T extends CosmosEventTypeKeys>(type: T, listener: CosmosEventTypes[T]) {
  if (type === 'AccountChanged') {
    window.removeEventListener('cosmostation_keystorechange', listener);
  }
}

export function addCosmosChain(props: CosAddChainParams): Promise<boolean> {
  return request({ method: 'cos_addChain', params: props });
}

export async function cosmos(chainId: string): Promise<Cosmos> {
  const chainID = chainId;

  if (!(await isInstalled())) {
    throw new Error('Cosmostation Wallet not installed');
  }

  const supportedChainIds = await getSupportedChainIds();

  if (!supportedChainIds.includes(chainID)) {
    throw new Error(`Unsupported chainId: ${chainID}`);
  }

  const cosmosFunctions = {
    requestAccount: () => requestAccount(chainID),
    signAmino: (document: CosmosSignAminoDoc, options?: CosmosSignOptions) => signAmino(chainID, document, options),
    signDirect: (document: CosmosSignDirectDoc, options?: CosmosSignOptions) => signDirect(chainID, document, options),
    sendTransaction: (txBytes: string, mode?: number) => sendTransaction(chainID, txBytes, mode),
    signAndSendTransaction: (props: CosmosSignAndSendTransactionProps, options: CosmosSignOptions) =>
      signAndSendTransaction(chainID, props, options),
    signMessage: (message: string) => signMessage(chainID, message),
    verifyMessage: (message: string, signature: string) => verifyMessage(chainID, message, signature),
    on,
    off,
  };
  return cosmosFunctions;
}

export async function requestAccount(chainId: string): Promise<CosmosRequestAccountResponse> {
  try {
    const account = await request({
      method: 'cos_requestAccount',
      params: { chainName: chainId },
    });

    return {
      name: account.name,
      is_ledger: !!account.isLedger,
      public_key: {
        type: account.isEthermint ? 'ethsecp256k1' : 'secp256k1',
        value: Buffer.from(account.publicKey).toString('base64'),
      },
      address: account.address,
    };
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
}
export async function signAmino(
  chainId: string,
  document: CosmosSignAminoDoc,
  options?: CosmosSignOptions
): Promise<CosmosSignAminoResponse> {
  try {
    const response = await request({
      method: 'cos_signAmino',
      params: {
        chainName: chainId,
        doc: document,
        isEditFee: options?.edit_mode?.fee,
        isEditMemo: options?.edit_mode?.memo,
      },
    });

    return {
      signature: response.signature,
      signed_doc: response.signed_doc,
    };
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
}

export async function signDirect(
  chainId: string,
  document: CosmosSignDirectDoc,
  options?: CosmosSignOptions
): Promise<CosmosSignDirectResponse> {
  const body_bytes =
    typeof document.body_bytes === 'string' ? toUint8Array(document.body_bytes) : new Uint8Array(document.body_bytes);
  const auth_info_bytes =
    typeof document.auth_info_bytes === 'string'
      ? toUint8Array(document.auth_info_bytes)
      : new Uint8Array(document.auth_info_bytes);

  try {
    const response = await request({
      method: 'cos_signDirect',
      params: {
        chainName: chainId,
        doc: { ...document, body_bytes, auth_info_bytes },
        isEditFee: options?.edit_mode?.fee,
        isEditMemo: options?.edit_mode?.memo,
      },
    });

    return {
      signature: response.signature,
      signed_doc: {
        auth_info_bytes: new Uint8Array(response.signed_doc.auth_info_bytes),
        body_bytes: new Uint8Array(response.signed_doc.body_bytes),
      },
    };
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
}

export async function sendTransaction(
  chainId: string,
  txBytes: string,
  mode?: number
): Promise<CosmosSendTransactionResponse> {
  const txMode = mode ?? 2;
  const response = await request({
    method: 'cos_sendTransaction',
    params: {
      chainName: chainId,
      mode: txMode,
      txBytes,
    },
  });

  return response;
}

export async function getSupportedChainIds(): Promise<string[]> {
  const response = await request({ method: 'cos_supportedChainIds' });

  return [...response.official, ...response.unofficial];
}

export async function signAndSendTransaction(
  chainId: string,
  props: CosmosSignAndSendTransactionProps,
  options?: CosmosSignOptions
): Promise<CosmosSendTransactionResponse> {
  const account = await requestAccount(chainId);

  const CosmosProto = await getCosmosTxProto({
    ...props,
    chain_id: chainId,
    public_key: {
      type_url: account.public_key.type,
      key: account.public_key.value,
    },
    signer: account.address,
  });

  const signDirectResponse = await signDirect(
    chainId,
    {
      chain_id: chainId,
      auth_info_bytes: CosmosProto.auth_info_bytes,
      body_bytes: CosmosProto.body_bytes,
      account_number: CosmosProto.account_number,
    },
    options
  );

  const tx_bytes = await getCosmosTxProtoBytes({
    signature: signDirectResponse.signature,
    ...signDirectResponse.signed_doc,
  });
  const response = await sendTransaction(chainId, tx_bytes, 2);

  return response;
}

export async function signMessage(chainId: string, message: string): Promise<CosmosSignMessageResponse> {
  const account = await requestAccount(chainId);

  const response = await request({
    method: 'cos_signMessage',
    params: {
      chainName: chainId,
      message,
      signer: account.address,
    },
  });

  return response;
}

export async function verifyMessage(chainId: string, message: string, signature: string): Promise<boolean> {
  const account = await requestAccount(chainId);

  const response = await request({
    method: 'cos_verifyMessage',
    params: {
      chainName: chainId,
      message,
      signature,
      public_key: account.public_key.value,
    },
  });

  return response;
}

async function request({ method, params }: { method: string; params?: unknown }) {
  return await window.cosmostation.cosmos.request({ method, params });
}

function isInstalled(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (!!window.cosmostation) {
        clearInterval(interval);
        resolve(true);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      reject(false);
    }, 500);
  });
}
