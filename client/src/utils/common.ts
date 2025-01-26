import type { Wallet } from '@cosmos-kit/core';

export const shortenAddress = (address: string, partLength = 6) => {
  return `${address.slice(0, partLength)}...${address.slice(-partLength)}`;
};

export const getWalletLogo = (wallet: Wallet) => {
  if (!wallet?.logo) return '';

  return typeof wallet.logo === 'string' ? wallet.logo : wallet.logo.major || wallet.logo.minor;
};
