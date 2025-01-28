import { ReclaimDemo } from './ReclaimDemo';

import { WalletConnect } from './components/Wallet';
import { Auth } from './components/Auth';
import { ChainProvider } from '@cosmos-kit/react';
import { chains, assets } from 'chain-registry';
import { wallets } from './config/wallets';

function App() {
  return (
    <ChainProvider
      signerOptions={{
        preferredSignType: () => {
          return 'amino';
        },
      }}
      chains={chains}
      assetLists={assets}
      wallets={wallets}
    >
      <WalletConnect />
      <Auth />
      <ReclaimDemo />
    </ChainProvider>
  );
}

export default App;
