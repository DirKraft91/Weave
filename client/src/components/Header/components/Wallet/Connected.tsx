import { ChainWalletBase } from '@cosmos-kit/core';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, addToast } from '@heroui/react';
import { ClipboardDocumentIcon, ArrowLeftStartOnRectangleIcon, HomeIcon } from '@heroicons/react/24/outline';

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { getWalletLogo, shortenAddress } from '@/utils/common';
import { useNavigate } from '@tanstack/react-router';

export const Connected = ({
  selectedWallet,
  clearSelectedWallet,
}: {
  selectedWallet: ChainWalletBase;
  clearSelectedWallet: () => void;
}) => {
  const { walletInfo, disconnect, address } = selectedWallet;
  const { copyToClipboard } = useCopyToClipboard();
  const navigate = useNavigate();

  if (!address) return null;

  return (
    <Dropdown backdrop="transparent" placement="bottom-end">
      <DropdownTrigger>
        <Button color="secondary" variant="solid">
          {walletInfo && (
            <img
              src={getWalletLogo(walletInfo)}
              alt={walletInfo.prettyName}
              width="0"
              height="0"
              style={{ width: '20px', height: 'auto' }}
            />
          )}
          {shortenAddress(address)}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions" variant="faded">
        <DropdownItem
          key="new"
          onClick={() => {
            copyToClipboard(address);
            addToast({
              title: 'Address copied to clipboard',
              description: 'Address copied successfully',
              color: 'success',
            });
          }}
        >
          <div className="flex items-center gap-2">
            <ClipboardDocumentIcon width={16} height={16} />
            Copy Address
          </div>
        </DropdownItem>
        <DropdownItem
          key="new"
          onClick={() => {
            navigate({
              to: '/dashboard',
            });
          }}
        >
          <div className="flex items-center gap-2">
            <HomeIcon width={16} height={16} />
            Dashboard
          </div>
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          onClick={() => {
            clearSelectedWallet();
            disconnect();
          }}
        >
          <div className="flex items-center gap-2">
            <ArrowLeftStartOnRectangleIcon width={16} height={16} />
            Logout
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
