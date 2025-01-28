import { create } from 'zustand';
import { ChainWalletBase } from '@cosmos-kit/core';

interface WalletStore {
  selectedWallet: ChainWalletBase | null;
}

export const useWalletStore = create<WalletStore>()(() => ({
  selectedWallet: null,
}));

export const walletStore = {
  setSelectedWallet: (wallet: ChainWalletBase | null) => {
    useWalletStore.setState({ selectedWallet: wallet });
  },
};
