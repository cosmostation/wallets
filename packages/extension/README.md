## Install

```shell
npm i @cosmostation/wallets

# or

yarn add @cosmostation/wallets
```

## How to register a wallet

enter it as an example in the inject script.

```javascript
import { registCosmosWallet } from '@cosmostation/wallets';
import type { RegistCosmosWallet } from '@cosmostation/wallets';

// ...code...

const cosmosWallet: RegistCosmosWallet = {
  name: 'Cosmostation Wallet',
  logo: 'data:image/png;base64 or .png',
  methods: {
    requestAccount: async (chainID) => {
      try {
        const account = (await request({
          method: 'cos_requestAccount',
          params: { chainName: chainID },
        })) as CosRequestAccountResponse;

        return {
          name: account.name,
          isLedger: !!account.isLedger,
          publicKey: {
            type: account.isEthermint ? 'ethsecp256k1' : 'secp256k1',
            value: Buffer.from(account.publicKey).toString('base64'),
          },
          address: account.address,
        };
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    signAmino: async (chainID, document, options) => {
      try {
        const response = (await request({
          method: 'cos_signAmino',
          params: {
            chainName: chainID,
            doc: document as unknown as SignAminoDoc,
            isEditFee: options?.editMode?.fee,
            isEditMemo: options?.editMode?.memo,
          },
        })) as CosSignAminoResponse;

        return {
          publicKey: {
            type: response.pub_key.type === 'tendermint/PubKeySecp256k1' ? 'secp256k1' : 'ethsecp256k1',
            value: response.pub_key.value,
          },
          signature: response.signature,
          signedDoc: response.signed_doc,
        };
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    signDirect: async (chainID, document, options) => {
      try {
        const response = (await request({
          method: 'cos_signDirect',
          params: {
            chainName: chainID,
            doc: document as unknown as SignDirectDoc,
            isEditFee: options?.editMode?.fee,
            isEditMemo: options?.editMode?.memo,
          },
        })) as CosSignDirectResponse;

        return {
          publicKey: {
            type: response.pub_key.type === 'tendermint/PubKeySecp256k1' ? 'secp256k1' : 'ethsecp256k1',
            value: response.pub_key.value,
          },
          signature: response.signature,
          signedDoc: response.signed_doc,
        };
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    sendTransaction: async (chainId, txBytes, mode) => {
      const txMode = mode || 0;
      const response = (await request({
        method: 'cos_sendTransaction',
        params: {
          chainName: chainId,
          mode: txMode,
          txBytes: txBytes && typeof txBytes === 'object' ? Buffer.from(txBytes).toString('base64') : txBytes,
        },
      })) as CosSendTransactionResponse;

      return response;
    },

    getSupportedChainIDs: async () => {
      const response = (await request({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;

      return [...response.official, ...response.unofficial];
    },
  },
  events: {
    on: (type, listener) => {
      if (type === 'AccountChanged') {
        window.addEventListener('cosmostation_keystore', listener);
      }
    },
    off: (type, listener) => {
      if (type === 'AccountChanged') {
        window.removeEventListener('cosmostation_keystore', listener);
      }
    },
  },
};

registCosmosWallet(cosmosWallet);
// ...code...
```

## How to get wallets

```javascript
import { getCosmosWallets } from '@cosmostation/wallets';

// ...code...

const wallets = getCosmosWallets();
```
