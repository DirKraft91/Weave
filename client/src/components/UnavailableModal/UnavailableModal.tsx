import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';

import SpiderCryBlack from '@/assets/spider-cry-black.png';

interface UnavailableModalProps {
  isOpen: boolean;
}

export const UnavailableModal = ({ isOpen }: UnavailableModalProps) => {
  const navigate = useNavigate();

  const handleNavigateToDashboard = () => {
    navigate({ to: '/dashboard' });
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: 'bg-warning',
      }}
      isOpen={isOpen}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="pt-6 pb-0 px-2 flex flex-col items-center text-center">
          <h2 className="font-bold text-black text-3xl">Sorry, search is<br /> unavailable</h2>
        </ModalHeader>
        <ModalBody className="pt-0 pb-6 px-2 flex flex-col items-center">
          <img src={SpiderCryBlack} alt="Crying spider" />
          <span className="text-medium text-black text-center px-10">
            You need to verify at least one account to access search. Connect your Twitter or<br /> another supported account to proceed
          </span>
        </ModalBody>
        <ModalFooter className="flex justify-center px-10 pb-10">
          <Button
            variant="solid"
            className="w-full bg-default-100 px-24 py-8 text-medium"
            onClick={handleNavigateToDashboard}
          >
            Get Approve
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
