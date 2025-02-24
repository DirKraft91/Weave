import { useChainStore } from '@/contexts/chain';
import { useWalletStore } from '@/contexts/wallet';
import { useWalletClient } from '@cosmos-kit/react';

export const useSignArbitrary = () => {
  const { selectedWallet } = useWalletStore();
  const { selectedChain } = useChainStore();
  const { client, status } = useWalletClient(selectedWallet?.walletName);

  const sign = async (data: string) => {
    if (status !== 'Done') {
      throw new Error('Wallet is not connected');
    }
    const account = await client?.getAccount?.(selectedChain);
    if (!account) {
      throw new Error('Could not retrieve account');
    }

    const signResult = await client?.signArbitrary?.(selectedChain, account.address, data);

    return {
      signResult,
      account,
    };
  };

  return { sign };
};
