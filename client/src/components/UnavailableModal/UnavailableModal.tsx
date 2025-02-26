import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { Link } from '@tanstack/react-router';

import Logo from '@/assets/Logo.svg?react';
import SpiderCryBlack from '@/assets/spider-cry-black.png';

interface UnavailableModalProps {
  isOpen: boolean;
}

export const UnavailableModal = ({ isOpen }: UnavailableModalProps) => {
  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: 'bg-secondary',
      }}
      isOpen={isOpen}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader className="pt-6 pb-0 px-2 flex flex-col items-center text-center">
          <h2 className="font-bold text-2xl">Search Unavailable</h2>
          <Logo />
        </ModalHeader>
        <ModalBody className="pt-0 pb-6 px-2 flex flex-col items-center">
          <img src={SpiderCryBlack} alt="Crying spider" />
          <span className="text-medium text-center px-10 mb-4">
            You need to verify at least one account to access search. Connect your Twitter or another supported account to proceed
          </span>
        </ModalBody>
        <ModalFooter className="flex justify-center px-10">
          <Link to="/dashboard">
            <Button variant="solid" className="w-full">
              Get Approve
            </Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
