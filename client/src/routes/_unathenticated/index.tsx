import { AuthModal } from '@/components/AuthModal/AuthModal';
import { WalletConnectModal } from '@/components/WalletConnectModal/WalletConnectModal';
import { useWalletStore } from '@/contexts';
import { useDisclosure, Button } from '@heroui/react';
import { createFileRoute } from '@tanstack/react-router';
import { WalletStatus } from '@cosmos-kit/core';

export const Route = createFileRoute('/_unathenticated/')({
  component: RouteComponent,
});

function RouteComponent() {
  const authModal = useDisclosure();
  const walletConnectModal = useDisclosure();
  const { selectedWallet } = useWalletStore();

  const isWalletConnected = selectedWallet?.walletStatus === WalletStatus.Connected;

  const handleClick = () => {
    if (isWalletConnected) {
      authModal.onOpen();
    } else {
      walletConnectModal.onOpen();
    }
  };

  return (
    <div className="flex flex-1">
      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        <h1 className="text-8xl font-bold text-center">
          <span className="text-secondary">Weave</span> your accounts.
          <br />
          Secure your identity.
        </h1>
        <Button variant="solid" color="secondary" size="lg" onClick={handleClick}>
          {isWalletConnected ? 'Start Now' : 'Connect Wallet'}
        </Button>
        <AuthModal {...authModal} />
        <WalletConnectModal {...walletConnectModal} />
      </div>
    </div>
  );
}
