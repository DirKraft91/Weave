import { wallets as keplrwallets } from '@cosmos-kit/keplr';
import { wallets as leapwallets } from '@cosmos-kit/leap';

export const wallets = [...keplrwallets, ...leapwallets].filter((w) => {
  return w.isModeExtension && w.walletName !== 'leap-metamask-cosmos-snap';
});
