import { create } from 'zustand';
import { chains } from 'chain-registry';

interface ChainStore {
  selectedChain: string;
}

export const defaultChain = chains.find((chain) => chain.chain_type === "cosmos")?.chain_name || "cosmoshub-4";

export const useChainStore = create<ChainStore>()(() => ({
  selectedChain: defaultChain,
}));

export const chainStore = {
  setSelectedChain: (chainName: string) => {
    useChainStore.setState({ selectedChain: chainName });
  },
};
