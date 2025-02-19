import { useMemo } from 'react';
import { ChainWalletBase, WalletStatus } from '@cosmos-kit/core';

import { getWalletLogo } from '@/utils/common';
import { RingLoader } from './RingLoader';

export const Connecting = ({
  selectedWallet,
  clearSelectedWallet,
}: {
  selectedWallet: ChainWalletBase;
  clearSelectedWallet: () => void;
}) => {
  const { walletInfo, downloadInfo, message, walletStatus } = selectedWallet;

  const content = useMemo(() => {
    if (walletStatus === WalletStatus.NotExist) {
      return (
        <>
          <WalletLogoWithRing wallet={walletInfo} intent="warning" />
          <StatusText>{walletInfo.prettyName} Not Installed</StatusText>
          {downloadInfo?.link && (
            <a href={downloadInfo.link} target="_blank">
              <button>Install {walletInfo.prettyName}</button>
            </a>
          )}
        </>
      );
    }

    if (walletStatus === WalletStatus.Connecting) {
      return (
        <>
          <WalletLogoWithRing wallet={walletInfo} intent="connecting" />
          <StatusText>Requesting Connection</StatusText>
        </>
      );
    }

    if (walletStatus === WalletStatus.Rejected) {
      return (
        <>
          <WalletLogoWithRing wallet={walletInfo} intent="warning" />
          <StatusText>Request Rejected</StatusText>
        </>
      );
    }

    return (
      <>
        <WalletLogoWithRing wallet={walletInfo} intent="warning" />
        <StatusText>Connection Error</StatusText>
        {message && <StatusDescription>{message}</StatusDescription>}
      </>
    );
  }, [walletInfo, walletStatus, message]);

  return (
    <div>
      <div>
        <div onClick={clearSelectedWallet}>close arrowLeftSLine</div>
        <span>{walletInfo.prettyName}</span>
        arrowLeftSLine
      </div>
      {content}
    </div>
  );
};

const StatusText = ({ children }: { children: React.ReactNode }) => {
  return <span>{children}</span>;
};

const StatusDescription = ({ children }: { children: React.ReactNode }) => {
  return <span>{children}</span>;
};

const WalletLogoWithRing = ({
  wallet,
  intent,
}: {
  wallet: ChainWalletBase['walletInfo'];
  intent: 'connecting' | 'warning';
}) => {
  const isConnecting = intent === 'connecting';

  return (
    <div>
      <RingLoader angle={isConnecting ? 80 : 360} radius={55} isSpinning={isConnecting}>
        <img
          src={getWalletLogo(wallet)}
          alt={wallet.prettyName}
          width="0"
          height="0"
          style={{ width: '40px', height: 'auto' }}
        />
      </RingLoader>
      {!isConnecting && (
        <div>
          <span>!</span>
        </div>
      )}
    </div>
  );
};
