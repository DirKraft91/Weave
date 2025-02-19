/* eslint-disable @typescript-eslint/ban-ts-comment */
import { MainWalletBase, ChainWalletBase } from '@cosmos-kit/core';
import { Keplr } from '@keplr-wallet/types';

import { wallets } from '@/config/wallets';
import { getWalletLogo } from '@/utils/common';
import { makeKeplrChainInfo } from '@/utils/faucet';
import { useChainStore } from '@/contexts';

export const SelectWallet = ({
  setSelectedWallet,
}: {
  setSelectedWallet: (wallet: ChainWalletBase | null) => void;
}) => {
  const { selectedChain } = useChainStore();

  const handleSelectWallet = (wallet: MainWalletBase) => async () => {
    const chainWallet = wallet.getChainWallet(selectedChain)!;
    const chainInfo = makeKeplrChainInfo(chainWallet.chain, chainWallet.assets[0]);

    if (!chainWallet) {
      throw new Error('ChainWallet is not exist');
    }

    try {
      if (wallet.walletName.startsWith('keplr')) {
        // @ts-ignore
        await (chainWallet.client?.client as Keplr).experimentalSuggestChain(chainInfo);
      }
      await chainWallet.connect();
      setSelectedWallet(chainWallet);
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
