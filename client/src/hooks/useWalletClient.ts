import { useWalletStore } from '@/contexts/wallet';
import { useWalletClient as useWalletClientCosmos } from '@cosmos-kit/react';

export const useWalletClient = () => {
  const { selectedWallet } = useWalletStore();
  return useWalletClientCosmos(selectedWallet?.walletName);
};
