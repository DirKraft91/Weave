import { useChainStore, useWalletStore } from '@/contexts';
import { useWalletClient } from '@cosmos-kit/react';
import { FC, useEffect } from 'react';

const CHECK_TOKEN_INTERVAL = 60000;

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
        nonce: Date.now().toString(),
        message: 'Hello, Keplr!',
      });

      const signResult = await client?.signArbitrary?.(selectedChain, account.address, message);

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
      localStorage.setItem('access_token', responseData.access_token);
      localStorage.setItem('refresh_token', responseData.refresh_token);
      console.log('Auth tokens saved:', {
        access: responseData.access_token.substring(0, 10) + '...',
        refresh: responseData.refresh_token.substring(0, 10) + '...'
      });
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  const refreshTokens = async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');

      if (!refresh_token) {
        throw new Error('No refresh token found');
      }

      const response = await fetch('http://localhost:8080/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      console.log('Tokens refreshed:', data);
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      throw error;
    }
  };

  // Auto refresh token
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const access_token = localStorage.getItem('access_token');
      if (!access_token) return;

      try {
        // Decode JWT to check expiration time
        const payload = JSON.parse(atob(access_token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // convert to milliseconds

        // If token expires in 5 minutes or less
        if (Date.now() >= expirationTime - 5 * 60 * 1000) {
          await refreshTokens();
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    };

    const interval = setInterval(checkAndRefreshToken, CHECK_TOKEN_INTERVAL); // check every INTERVAL
    return () => clearInterval(interval);
  }, []);

  if (!selectedWallet) return null;

  return <button onClick={handleSignIn}>SignIn</button>;
};
