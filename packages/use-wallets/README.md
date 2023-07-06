## Install

```shell
npm i @cosmostation/use-wallets

# or

yarn add @cosmostation/use-wallets
```

## e.g.

```javascript
import { useCosmosAccount, useCosmosWallets } from '@cosmostation/use-wallets';

export default function Home() {
  const { currentWallet, selectWallet, cosmosWallets } = useCosmosWallets();
  const { account, reRequest } = useCosmosAccount('cosmoshub-4');

  useEffect(() => {
    console.log('account', account);
  }, [account]);

  return (
    <div>
      <button type="button" onClick={reRequest}>
        reRequest
      </button>

      {cosmosWallets.map((wallet) => (
        <button key={wallet.id} type="button" onClick={() => selectWallet(wallet.id)}>
          {wallet.name} <img src={wallet.logo} alt={wallet.name} />
        </button>
      ))}
    </div>
  );
}
```
