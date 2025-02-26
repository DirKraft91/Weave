import { AuthModal } from '@/components/AuthModal/AuthModal';
import { WalletConnectModal } from '@/components/WalletConnectModal/WalletConnectModal';
import { useAuthStore, useWalletStore } from '@/contexts';
import { WalletStatus } from '@cosmos-kit/core';
import { Button, useDisclosure } from '@heroui/react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_unathenticated/')({
  component: RouteComponent,
});

function RouteComponent() {
  const authModal = useDisclosure();
  const walletConnectModal = useDisclosure();
  const { selectedWallet } = useWalletStore();
  const { authToken } = useAuthStore();
  const navigate = useNavigate();

  const isAuthenticated = !!authToken;
  const isWalletConnected = selectedWallet?.walletStatus === WalletStatus.Connected;

  const handleClick = () => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }

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
        <h2 className="text-lg text-center leading-7 text-foreground-600">
          Effortlessly link your accounts and prove ownership with privacy-first security.
          <br />
          Take control of your digital identity without compromising trust.
        </h2>
        <Button variant="solid" color="secondary" size="lg" onClick={handleClick}>
          {isAuthenticated ? 'Go To Dashboard' : isWalletConnected ? 'Start Now' : 'Connect Wallet'}
        </Button>
        <AuthModal {...authModal} />
        <WalletConnectModal {...walletConnectModal} />

      </div>

    </div>
  );
}
