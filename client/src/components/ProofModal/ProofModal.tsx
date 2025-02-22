import { useEffectOnce } from "@/hooks/useEffectOnce";
import { proofService } from "@/services/proof.service";
import { Button, Divider, Modal, ModalBody, ModalContent, ModalFooter } from "@heroui/react";
import { useCallback, useState } from "react";
import QRCode from "react-qr-code";
import { Provider } from "../ProviderCard";

interface ProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
}

export function ProofModal({ isOpen, onClose, provider }: ProofModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [requestUrl, setRequestUrl] = useState("");

  const handleGetVerification = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = await proofService.getVerificationRequest(provider);
      setRequestUrl(url);
    } catch (error) {
      console.error('Failed to get verification:', error);
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  useEffectOnce(() => {
    handleGetVerification();
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent className="bg-secondary">
        <ModalBody>
          {requestUrl && (
            <div className="w-full h-full flex justify-center items-center p-5">
              <QRCode value={requestUrl} />
            </div>
          )}
        </ModalBody>

        <Divider />

        <ModalFooter className="flex flex-col gap-6">
          <span className="text-medium text-center px-10">
            Scan this QR Code
          </span>
          <Button
            isLoading={isLoading}
            variant="solid"
            onClick={handleGetVerification}
          >
            Generate new link
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
