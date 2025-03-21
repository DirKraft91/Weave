/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ChainWalletBase, MainWalletBase, WalletStatus } from '@cosmos-kit/core';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  addToast,
  closeAll as closeAllToasts,
} from '@heroui/react';
import { Keplr } from '@keplr-wallet/types';

import Logo from '@/assets/Logo.svg?react';
import Icon from '@/assets/spider-default.png';
import { wallets } from '@/config/wallets';
import { useChainStore, walletStore } from '@/contexts';
import { getWalletLogo } from '@/utils/common';
import { makeKeplrChainInfo } from '@/utils/faucet';
import { useState } from 'react';

export const WalletConnectModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { selectedChain } = useChainStore();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletStatus = (wallet: ChainWalletBase) => {
    closeAllToasts();
    if (wallet.walletStatus === WalletStatus.Error) {
      addToast({
        title: 'Error',
        description: 'Failed to connect to wallet',
        color: 'danger',
        timeout: 3000,
        priority: 1,
      });
    }

    if (wallet.walletStatus === WalletStatus.NotExist) {
      addToast({
        title: 'Error',
        description: 'Wallet not installed',
        color: 'danger',
        timeout: 3000,
        priority: 2,
      });
    }

    if (wallet.walletStatus === WalletStatus.Rejected) {
      addToast({
        title: 'Rejected',
        description: 'Connection rejected',
        color: 'danger',
        timeout: 3000,
        priority: 0,
      });
    }

    if (wallet.walletStatus === WalletStatus.Connected) {
      addToast({
        title: 'Connected',
        description: 'Connected to wallet',
        color: 'success',
        timeout: 3000,
        priority: 0,
      });
    }
  };

  const handleSelectWallet = (wallet: MainWalletBase) => async () => {
    try {
      setIsConnecting(true);
      const chainWallet = wallet.getChainWallet(selectedChain)!;
      const chainInfo = makeKeplrChainInfo(chainWallet.chain, chainWallet.assets[0]);

      if (!chainWallet) {
        throw new Error('ChainWallet is not exist');
      }
      if (wallet.walletName.startsWith('keplr')) {
        // @ts-ignore
        await (chainWallet.client?.client as Keplr).experimentalSuggestChain(chainInfo);
      }
      await chainWallet.connect();
      handleWalletStatus(chainWallet);
      walletStore.setSelectedWallet(chainWallet);
      if (chainWallet.walletStatus === WalletStatus.Connected) {
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <Modal
        backdrop="blur"
        classNames={{
          base: 'bg-secondary',
        }}
        isOpen={isOpen}
        onClose={onClose}
        hideCloseButton
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="pt-6 pb-0 px-2 flex flex-col items-center text-center">
                <h2 className="font-bold text-2xl">Welcome to</h2>
                <Logo />
              </ModalHeader>
              <ModalBody className="pt-0 pb-6 px-2 flex flex-col items-center">
                <img src={Icon} alt="Icon" />
                <span className="text-medium text-center">Choose your preferred wallet</span>
                <div className="flex items-center flex-row gap-4">
                  {wallets.map((w) => (
                    <Button
                      variant="light"
                      className="flex items-center flex-col h-auto py-2"
                      onClick={handleSelectWallet(w)}
                      key={w.walletName}
                      isDisabled={isConnecting}
                    >
                      <div className="overflow-hidden rounded-md">
                        <img
                          src={getWalletLogo(w.walletInfo)}
                          alt={w.walletPrettyName}
                          width="0"
                          height="0"
                          style={{ width: '42px', height: '42px', objectFit: 'contain', objectPosition: 'center' }}
                        />
                      </div>
                      <span className="text-sm font-medium">{w.walletPrettyName}</span>
                    </Button>
                  ))}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
