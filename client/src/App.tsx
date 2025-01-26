import { ReclaimDemo } from './ReclaimDemo';

import { WalletConnect } from './components/Wallet';
import { ChainProvider } from '@cosmos-kit/react';
import { chains, assets } from 'chain-registry';
import { wallets } from './config/wallets';

function App() {
  return (
    <ChainProvider chains={chains} assetLists={assets} wallets={wallets}>
      <WalletConnect />
      <ReclaimDemo />
    </ChainProvider>
  );
}

export default App;
