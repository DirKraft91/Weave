import { FC, useEffect } from 'react';
import { useWalletClient } from '@cosmos-kit/react';
import { useChainStore, useWalletStore } from '@/contexts';

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

      // Отправка на бэкенд
      await fetch('http://localhost:8080/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: signResult?.signature,
          public_key: signResult?.pub_key.value,
          message,
        }),
      });
    } catch (error) {
      console.error('Ошибка подписи сообщения:', error);
    }
  };

  if (!selectedWallet) return null;

  return <button onClick={handleSignIn}>SignIn</button>;
};
