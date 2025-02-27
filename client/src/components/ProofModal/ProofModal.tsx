import { useChainStore } from '@/contexts/chain';
import { useApplyProof, usePrepareProof } from '@/hooks/useApiQueries';
import { useAsyncExecutor } from '@/hooks/useAsyncExecutor';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { useSignArbitrary } from '@/hooks/useSignArbitrary';
import { useWalletClient } from '@/hooks/useWalletClient';
import { Proof, proofService } from '@/services/proof.service';
import { addToast, Button, Modal, ModalBody, ModalContent, ModalFooter } from '@heroui/react';
import { Proof as ReclaimProof } from '@reclaimprotocol/js-sdk';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Provider } from '../ProviderCard';

interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
}

export function ProofModal({ isOpen, onClose, provider }: ProofModalProps) {
  const [requestUrl, setRequestUrl] = useState('');
  const signArbitrary = useSignArbitrary();
  const { selectedChain } = useChainStore();
  const { client: walletClient } = useWalletClient();
  const prepareProofMutation = usePrepareProof();
  const applyProofMutation = useApplyProof();

  const getDataToSign = async (proof: ReclaimProof) => {
    const proofCopy = { ...proof, publicData: undefined };
    const account = await walletClient?.getAccount?.(selectedChain);
    if (!account) {
      throw new Error('Account not found');
    }
    const response = await prepareProofMutation.mutateAsync({
      proof: proofCopy,
      provider_id: provider.providerId,
      signer: account.address,
    });

    return response.data;
  };

  const saveProofMutation = async (proof: Proof) => {
    try {
      const dataToSign = await getDataToSign(proof);
      const { signResult, account } = await signArbitrary.sign(dataToSign);
      await applyProofMutation.mutateAsync({
        signer: account.address,
        public_key: signResult?.pub_key.value,
        signature: signResult?.signature || '',
        data: dataToSign,
        provider_id: provider.providerId,
        proof: { ...proof, publicData: undefined },
      });
      onClose();
    } catch {
      // Error handling is done in the mutation hooks
    }
  };

  const verificationRequest = useAsyncExecutor(async () => {
    const url = await proofService.initializeVerificationRequest({
      providerId: provider.providerId,
      onSuccess: async (proof: Proof) => {
        await saveProofMutation(proof);
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

  const isLoading = verificationRequest.isLoading ||
    prepareProofMutation.isPending ||
    applyProofMutation.isPending;

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
        if (isLoading) return;
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
            isLoading={isLoading}
            isDisabled={isLoading}
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
