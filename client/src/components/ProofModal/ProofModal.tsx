import { useEffectOnce } from '@/hooks/useEffectOnce';
import { proofService } from '@/services/proof.service';
import { Proof as ReclaimProof } from '@reclaimprotocol/js-sdk';
import { addToast, Button, closeAll, Modal, ModalBody, ModalContent, ModalFooter } from '@heroui/react';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Provider } from '../ProviderCard';
import { useSignArbitrary } from '@/hooks/useSignArbitrary';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Proof } from '@/services/proof.service';
import { useWalletClient } from '@/hooks/useWalletClient';
import { useChainStore } from '@/contexts/chain';
import { useAsyncExecutor } from '@/hooks/useAsyncExecutor';
interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
}

export function ProofModal({ isOpen, onClose, provider }: ProofModalProps) {
  const [requestUrl, setRequestUrl] = useState('');
  const signArbitrary = useSignArbitrary();
  const queryClient = useQueryClient();
  const { selectedChain } = useChainStore();
  const { client: walletClient } = useWalletClient();

  const getDataToSign = async (proof: ReclaimProof) => {
    const proofCopy = { ...proof, publicData: undefined };
    const account = await walletClient?.getAccount?.(selectedChain);
    if (!account) {
      throw new Error('Account not found');
    }
    const response = await proofService.prepareProof({
      proof: proofCopy,
      provider_id: provider.providerId,
      signer: account.address,
    });

    return response.data;
  };

  const saveProofMutation = useMutation({
    mutationFn: async (proof: Proof) => {
      try {
        const dataToSign = await getDataToSign(proof);
        const { signResult, account } = await signArbitrary.sign(dataToSign);
        await proofService.applyProof({
          signer: account.address,
          public_key: signResult?.pub_key.value,
          signature: signResult?.signature || '',
          data: dataToSign,
          provider_id: provider.providerId,
          proof: { ...proof, publicData: undefined },
        });
        queryClient.invalidateQueries({
          queryKey: ['my-proofs'],
        });
        queryClient.invalidateQueries({
          queryKey: ['provider-stats'],
        });
        closeAll();
        addToast({
          title: 'Proof applied',
          description: 'Proof applied successfully',
          color: 'success',
          timeout: 3000,
          priority: 0,
        });
        onClose();
      } catch (error) {
        closeAll();
        addToast({
          title: 'Error applying proof',
          description: error instanceof Error ? error.message : 'Something went wrong',
          color: 'danger',
          timeout: 3000,
          priority: 0,
        });
      }
    },
  });

  const verificationRequest = useAsyncExecutor(async () => {
    const url = await proofService.initializeVerificationRequest({
      providerId: provider.providerId,
      onSuccess: async (proof: Proof) => {
        await saveProofMutation.mutateAsync(proof);
      },
      onError: async (error) => {
        addToast({
          title: 'Error generating proof link',
          description: error.message || 'Something went wrong',
          color: 'danger',
          timeout: 100000,
          priority: 0,
        });
      },
    });
    setRequestUrl(url);
  });

  useEffectOnce(() => {
    verificationRequest.asyncExecute();
  });

  return (
    <Modal
      classNames={{
        base: 'bg-secondary',
      }}
      backdrop="blur"
      portalContainer={document.getElementById('root') as Element}
      hideCloseButton
      isOpen={isOpen}
      onClose={() => {
        if (saveProofMutation.isPending) return;
        onClose();
      }}
    >
      <ModalContent className="bg-secondary">
        <ModalBody>
          {requestUrl && (
            <div className="w-full h-full flex justify-center items-center p-5">
              <div className="bg-white rounded-lg p-5">
                <QRCode value={requestUrl} />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="flex flex-col gap-6">
          <span className="text-medium text-center px-10">Scan this QR Code</span>
          <Button
            isLoading={verificationRequest.isLoading || saveProofMutation.isPending}
            isDisabled={verificationRequest.isLoading || saveProofMutation.isPending}
            variant="solid"
            onClick={verificationRequest.asyncExecute}
          >
            Generate new link
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
