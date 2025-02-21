import { useChain } from '@cosmos-kit/react';
import { useEffect } from 'react';

import { wallets } from '@/config/wallets';
import { useChainStore } from '@/contexts';
import { authStore } from '@/contexts/auth';
import { useWalletStore, walletStore } from '@/contexts/wallet';
import { authService } from '@/services/auth.service';
import { Connected } from './Connected';
import { SelectWallet } from './SelectWallet';

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

  const handleDisconnect = async () => {
    await authService.logout();
    authStore.clearAuthToken();
    walletStore.setSelectedWallet(null);
  };

  if (selectedWallet && selectedWallet.isWalletConnected) {
    return (
      <Connected
        selectedWallet={selectedWallet}
        clearSelectedWallet={handleDisconnect}
      />
    );
  }

  return <SelectWallet />;
};
