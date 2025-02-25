import { useEffectOnce } from '@/hooks/useEffectOnce';
import { proofService } from '@/services/proof.service';
import { addToast, Button, closeAll, Modal, ModalBody, ModalContent, ModalFooter } from '@heroui/react';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Provider } from '../ProviderCard';
import { useAsyncExecutor } from '@/hooks/useAsyncExecutor';
import { useSignArbitrary } from '@/hooks/useSignArbitrary';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Proof } from '@/services/proof.service';
interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
}

export function ProofModal({ isOpen, onClose, provider }: ProofModalProps) {
  const [requestUrl, setRequestUrl] = useState('');
  const signArbitrary = useSignArbitrary();
  const client = useQueryClient();

  const saveProofMutation = useMutation({
    mutationFn: async (proof: Proof) => {
      const proofCopy = { ...proof, publicData: undefined };

      try {
        const { signResult, account } = await signArbitrary.sign(JSON.stringify(proofCopy));
        await proofService.saveProof({
          signer: account.address,
          public_key: signResult?.pub_key.value,
          signature: signResult?.signature || '',
          data: proofCopy,
          provider: provider.id,
        });
        client.invalidateQueries({
          queryKey: ['my-proofs'],
        });
        closeAll();
        addToast({
          title: 'Proof saved',
          description: 'Proof saved successfully',
          color: 'success',
          timeout: 3000,
          priority: 0,
        });
        onClose();
      } catch (error) {
        closeAll();
        addToast({
          title: 'Error saving proof',
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
      onClose={onClose}
    >
      <ModalContent className="bg-secondary">
        <ModalBody>
          {requestUrl && (
            <div className="w-full h-full flex justify-center items-center p-5">
              <QRCode value={requestUrl} />
            </div>
          )}
        </ModalBody>
        <ModalFooter className="flex flex-col gap-6">
          <span className="text-medium text-center px-10">Scan this QR Code</span>
          <Button isLoading={verificationRequest.isLoading} variant="solid" onClick={verificationRequest.asyncExecute}>
            Generate new link
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
