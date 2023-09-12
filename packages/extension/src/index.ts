import {
  cosmos,
  signAmino,
  signAndSendTransaction,
  signDirect,
  sendTransaction,
  requestAccount,
  getSupportedChainIds,
  addCosmosChain,
  on,
  off,
  CosmosSignAndSendTransactionProps,
} from './cosmos';
import {
  CosmosSignAminoDoc,
  CosmosSignDirectDoc,
  CosmosRequestAccountResponse,
  CosmosSignOptions,
  CosmosSignDirectResponse,
  CosmosSignAminoResponse,
  CosmosSendTransactionResponse,
  toUint8Array,
  toHexString,
} from '@cosmostation/wallets';

const cosmosFunctions = {
  on,
  off,
  signAmino,
  signAndSendTransaction,
  signDirect,
  sendTransaction,
  requestAccount,
  getSupportedChainIds,
  addCosmosChain,
};

export {
  cosmos,
  cosmosFunctions,
  CosmosSignAndSendTransactionProps,
  CosmosSignAminoDoc,
  CosmosSignDirectDoc,
  CosmosRequestAccountResponse,
  CosmosSignOptions,
  CosmosSignDirectResponse,
  CosmosSignAminoResponse,
  CosmosSendTransactionResponse,
  toUint8Array,
  toHexString,
};
