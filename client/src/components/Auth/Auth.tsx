import { useChainStore, useWalletStore } from '@/contexts';
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
      const account = await client?.getAccount(selectedChain);
      if (!account) {
        throw new Error('Could not retrieve account');
      }

      const message = JSON.stringify({
        chain_id: selectedChain,
        account: account.address,
        nonce: Date.now().toString(), // Date.now().toString(), // Используем таймстемп для защиты от replay attack
        message: 'Hello, Keplr!',
      });

      const signResult = await client?.signArbitrary(selectedChain, account.address, message);

      const response = await fetch('http://localhost:8080/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signer: account.address,
          public_key: signResult?.pub_key.value,
          signature: signResult?.signature,
          message,
        }),
      });

      // Add debug logging
      console.log('Request payload:', {
        signer: account.address,
        public_key: signResult?.pub_key.value,
        signature: signResult?.signature,
        message,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      localStorage.setItem('jwt_token', responseData.token);
      console.log('Auth response:', responseData);
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  if (!selectedWallet) return null;

  return <button onClick={handleSignIn}>SignIn</button>;
};
