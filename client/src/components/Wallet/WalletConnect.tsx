import { useEffect } from 'react';
import { useChain } from '@cosmos-kit/react';

import { useChainStore } from '@/contexts';
import { Connected } from './Connected';
import { Connecting } from './Connecting';
import { SelectWallet } from './SelectWallet';
import { wallets } from '@/config/wallets';
import { useWalletStore, walletStore } from '@/contexts/wallet';

export const WalletConnect = () => {
  const { selectedChain } = useChainStore();
  const { selectedWallet } = useWalletStore();
  const { wallet } = useChain(selectedChain);
  const currentWallet = wallets.find((w) => w.walletName === wallet?.name);
  const chainWallet = currentWallet?.getChainWallet(selectedChain);

  useEffect(() => {
    if (chainWallet?.isWalletConnected) {
      walletStore.setSelectedWallet(chainWallet);
    }
  }, [chainWallet?.isWalletConnected]);

  if (selectedWallet && selectedWallet.isWalletConnected) {
    return (
      <Connected selectedWallet={selectedWallet} clearSelectedWallet={() => walletStore.setSelectedWallet(null)} />
    );
  }

  if (selectedWallet) {
    return (
      <Connecting selectedWallet={selectedWallet} clearSelectedWallet={() => walletStore.setSelectedWallet(null)} />
    );
  }

  return <SelectWallet setSelectedWallet={walletStore.setSelectedWallet} />;
};
