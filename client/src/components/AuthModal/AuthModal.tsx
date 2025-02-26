/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button, Modal, ModalBody, ModalContent, ModalHeader, addToast, closeAll } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';

import Logo from '@/assets/Logo.svg?react';
import { useChainStore } from '@/contexts';
import { authStore } from '@/contexts/auth';
import { authService } from '@/services/auth.service';
import Icon from './assets/Icon.png';
import { useSignArbitrary } from '@/hooks/useSignArbitrary';
import { useWalletClient } from '@/hooks/useWalletClient';
import { useMutation } from '@tanstack/react-query';
import { fromUint8ArrayToString } from '@/utils/fromUint8ArrayToString';

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { selectedChain } = useChainStore();
  const navigate = useNavigate();
  const { client } = useWalletClient();
  const { sign } = useSignArbitrary();

  const fetchAuthData = async () => {
    try {
      const account = await client?.getAccount?.(selectedChain);

      if (!account) {
        throw new Error('Could not retrieve account');
      }

      const response = await authService.prepareAuthData({
        signer: account.address,
        public_key: fromUint8ArrayToString(account.pubkey),
      });

      return response.data;
    } catch (error) {
      closeAll();
      addToast({
        title: 'Error',
        description: 'Could not prepare auth data',
        color: 'danger',
        timeout: 3000,
        priority: 0,
      });
      throw error;
    }
  };

  const auth = async (dataToSign: Uint8Array) => {
    try {
      const { signResult, account } = await sign(dataToSign);
      const response = await authService.login({
        signer: account.address,
        public_key: signResult?.pub_key.value,
        signature: signResult?.signature || '',
        data: dataToSign,
      });
      authStore.setAuthToken(response.data.accessToken);
      closeAll();
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
        description: 'Authentication failed',
        color: 'danger',
        timeout: 3000,
        priority: 0,
      });
      throw error;
    }
  };

  const signIn = useMutation({
    mutationFn: async () => {
      const dataToSign = await fetchAuthData();
      await auth(dataToSign);
    },
  });

  return (
    <>
      <Modal
        backdrop="blur"
        classNames={{
          base: 'bg-secondary',
        }}
        isOpen={isOpen}
        onClose={() => {
          if (signIn.isPending) return;
          onClose();
        }}
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
                  <Button variant="light" onClick={onClose} isDisabled={signIn.isPending} className="w-1/2">
                    Close
                  </Button>
                  <Button
                    variant="solid"
                    onClick={() => {
                      signIn.mutateAsync();
                    }}
                    isLoading={signIn.isPending}
                    isDisabled={signIn.isPending}
                    className="w-1/2"
                  >
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
