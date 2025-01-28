import { FC } from 'react';
import { useWalletClient } from '@cosmos-kit/react';
import { State } from '@cosmos-kit/core';
import { useChainStore, useWalletStore } from '@/contexts';

export const Auth: FC = () => {
  const { selectedWallet } = useWalletStore();
  const { selectedChain } = useChainStore();
  const { client, status } = useWalletClient(selectedWallet?.walletName || undefined);

  const handleSignIn = async () => {
    if (status !== State.Done) {
      throw new Error('The wallet is not connected');
    }

    if (!client?.getAccount) {
      throw new Error('The wallet does not support getting account');
    }

    if (!client.signArbitrary) {
      throw new Error('The wallet does not support signing arbitrary message');
    }

    const account = await client.getAccount(selectedChain);
    const result = await client.signArbitrary(
      selectedChain,
      account?.address,
      btoa(String.fromCharCode(...new TextEncoder().encode('The app try will be used to connect into prism network'))),
    );

    console.log(result);
  };

  if (!selectedWallet) return null;

  return <button onClick={handleSignIn}>SignIn</button>;
};
