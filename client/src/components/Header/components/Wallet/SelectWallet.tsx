import { useDisclosure } from '@heroui/react';

import { Button } from '@heroui/react';
import { WalletConnectModal } from '@/components/WalletConnectModal';

export const SelectWallet = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button color="secondary" variant="solid" onClick={onOpen}>
        Connect wallet
      </Button>
      <WalletConnectModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};
