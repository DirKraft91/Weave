import { useChainStore, useWalletStore } from '@/contexts';
import { useTokens } from '@/hooks/useTokens';
import { useWalletClient } from '@cosmos-kit/react';
import { FC, useEffect } from 'react';

const CHECK_INTERVAL = 14 * 60 * 1000; // 14 minutes

export const Auth: FC = () => {
  const { selectedWallet } = useWalletStore();
  const { selectedChain } = useChainStore();
  const { client, status } = useWalletClient(selectedWallet?.walletName);
  const { refreshTokens } = useTokens();

  useEffect(() => {
    const checkAuth = async () => {
      const success = await refreshTokens();
      if (!success) {
        // TODO: redirect to login page ??
        console.log('Session expired, please sign in again');
      }
    };

    const interval = setInterval(checkAuth, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshTokens]);

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

      const response = await fetch('http://localhost:8080/auth', {
        method: 'POST',
        credentials: 'include',
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

      console.log('Auth successful:', response);
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  if (!selectedWallet) return null;

  return <button onClick={handleSignIn}>SignIn</button>;
};
