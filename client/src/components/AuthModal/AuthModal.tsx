/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button, Modal, ModalBody, ModalContent, ModalHeader, addToast } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';

import Logo from '@/assets/Logo.svg?react';
import { useChainStore, useWalletStore } from '@/contexts';
import { authStore } from '@/contexts/auth';
import { useAsyncExecutor } from '@/hooks/useAsyncExecutor';
import { authService } from '@/services/auth.service';
import { useWalletClient } from '@cosmos-kit/react';
import Icon from './assets/Icon.png';

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { selectedWallet } = useWalletStore();
  const { selectedChain } = useChainStore();
  const { client, status } = useWalletClient(selectedWallet?.walletName);
  const navigate = useNavigate();

  const signIn = useAsyncExecutor(async () => {
    try {
      if (status !== 'Done') {
        throw new Error('Wallet is not connected');
      }
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

      const response = await authService.login({
        signer: account.address,
        public_key: signResult?.pub_key.value,
        signature: signResult?.signature || '',
        message,
      });

      if (!response.success) {
        throw new Error(response.message || 'Authentication failed');
      }

      if (response.data?.accessToken) {
        authStore.setAuthToken(response.data.accessToken);
      }

      onClose();

      addToast({
        title: 'Success',
        description: 'Authentication successful',
        color: 'success',
        timeout: 3000,
        priority: 0,
      });

      navigate({ to: '/dashboard' });
    } catch (error) {
      addToast({
        title: 'Error',
        description:
          error instanceof Error
            ? `Authentication failed: ${error.message}, please try again`
            : 'Authentication failed, please try again',
        color: 'danger',
        timeout: 3000,
        priority: 0,
      });
    }
  });

  return (
    <>
      <Modal
        backdrop="blur"
        classNames={{
          base: 'bg-secondary',
          backdrop: 'z-49',
        }}
        isOpen={isOpen}
        onClose={onClose}
        portalContainer={document.getElementById('root') as Element}
        hideCloseButton
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="pt-6 pb-0 px-2 flex flex-col items-center text-center">
                <h2 className="font-bold text-2xl">Connect to </h2>
                <Logo />
              </ModalHeader>
              <ModalBody className="pt-0 pb-6 px-2 flex flex-col items-center">
                <img src={Icon} alt="Icon" />
                <span className="text-medium text-center px-10">
                  After connecting you will be able to approve your providers
                </span>
                <div className="flex items-center flex-row gap-2 px-10 w-full">
                  <Button variant="light" onClick={onClose} isDisabled={signIn.isLoading} className="w-1/2">
                    Close
                  </Button>
                  <Button variant="solid" onClick={signIn.asyncExecute} isDisabled={signIn.isLoading} className="w-1/2">
                    Sign in
                  </Button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
