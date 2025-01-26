/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Dispatch, SetStateAction } from 'react';
import { MainWalletBase, ChainWalletBase } from '@cosmos-kit/core';
import { Keplr } from '@keplr-wallet/types';

import { wallets } from '@/config/wallets';
import { getWalletLogo } from '@/utils/common';
import { makeKeplrChainInfo } from '@/utils/faucet';
import { useChainStore } from '@/contexts';

export const SelectWallet = ({
  setSelectedWallet,
}: {
  setSelectedWallet: Dispatch<SetStateAction<ChainWalletBase | null>>;
}) => {
  const { selectedChain } = useChainStore();

  const handleSelectWallet = (wallet: MainWalletBase) => async () => {
    const chainWallet = wallet.getChainWallet(selectedChain)!;
    const chainInfo = makeKeplrChainInfo(chainWallet.chain, chainWallet.assets[0]);

    try {
      if (wallet.walletName.startsWith('keplr')) {
        // @ts-ignore
        await (chainWallet.client?.client as Keplr).experimentalSuggestChain(chainInfo);
      }
      await chainWallet.connect();
      // @ts-ignore
      const account = await chainWallet.client.getAccount(chainInfo.chainId);
      const base64PublicKey = btoa(String.fromCharCode(...account.pubkey));

      setSelectedWallet(chainWallet);

      console.log(base64PublicKey, 'Public Key', account);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {wallets.map((w) => (
        <div onClick={handleSelectWallet(w)} key={w.walletName}>
          <span>{w.walletPrettyName}</span>
          <img
            src={getWalletLogo(w.walletInfo)}
            alt={w.walletPrettyName}
            width="0"
            height="0"
            style={{ width: '20px', height: 'auto' }}
          />
        </div>
      ))}
    </div>
  );
};
