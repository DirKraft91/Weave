import { useChainStore, useWalletStore } from '@/contexts';
import { authService } from '@/services/auth.service';
import { useWalletClient } from '@cosmos-kit/react';
import { FC } from 'react';

export const Auth: FC = () => {
  const { selectedWallet } = useWalletStore();
  const { selectedChain } = useChainStore();
  const { client, status } = useWalletClient(selectedWallet?.walletName);


  const handleSignIn = async () => {
    if (status !== 'Done') {
      throw new Error('The wallet is not connected');
    }

    try {
      const account = await client?.getAccount?.(selectedChain);
      if (!account) {
        throw new Error('Could not retrieve account');
      }

      const message = JSON.stringify({
        chain_id: selectedChain,
        account: account.address,
        nonce: Date.now().toString(), // Use nonce for replay attack protection
        message: 'Hello, Keplr!',
      });

      const signResult = await client?.signArbitrary?.(selectedChain, account.address, message);

      const response = await authService.login({
        signer: account.address,
        public_key: signResult?.pub_key.value,
        signature: signResult?.signature || '',
        message,
      });

      if (!response.success) {
        throw new Error(response.message || 'Authentication failed');
      }

      console.log('Auth successful:', response.message);
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  if (!selectedWallet) return null;

  return <button onClick={handleSignIn}>SignIn</button>;
};
