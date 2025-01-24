import { wallets as _wallets } from 'cosmos-kit';
import { MainWalletBase } from '@cosmos-kit/core';

// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
export const keplrWalletName = _wallets.keplr.extension?.walletName!;

export const wallets = [
  _wallets.keplr.extension,
  _wallets.leap.extension,
] as MainWalletBase[];
