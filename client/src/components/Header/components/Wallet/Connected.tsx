import { ChainWalletBase } from '@cosmos-kit/core';

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { getWalletLogo, shortenAddress } from '@/utils/common';

export const Connected = ({
  selectedWallet,
  clearSelectedWallet,
}: {
  selectedWallet: ChainWalletBase;
  clearSelectedWallet: () => void;
}) => {
  const { walletInfo, disconnect, address } = selectedWallet;

  const { isCopied, copyToClipboard } = useCopyToClipboard();

  if (!address) return null;

  return (
    <div>
      <div>
        {walletInfo && (
          <img
            src={getWalletLogo(walletInfo)}
            alt={walletInfo.prettyName}
            width="0"
            height="0"
            style={{ width: '20px', height: 'auto' }}
          />
        )}
        <span>{shortenAddress(address)}</span>
      </div>
      <div onClick={() => copyToClipboard(address)}>{isCopied ? 'checkLine' : 'copy'}</div>
      <div
        onClick={() => {
          clearSelectedWallet();
          disconnect();
        }}
      >
        Logout
      </div>
    </div>
  );
};
