import { create } from 'zustand';

interface ChainStore {
  selectedChain: string;
}

export const defaultChain = 'celestia';

export const useChainStore = create<ChainStore>()(() => ({
  selectedChain: defaultChain,
}));

export const chainStore = {
  setSelectedChain: (chainName: string) => {
    useChainStore.setState({ selectedChain: chainName });
  },
};
