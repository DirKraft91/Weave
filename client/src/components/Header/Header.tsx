import { Auth } from './components/Auth';
import { WalletConnect } from './components/Wallet';

export const Header = () => {
  return (
    <header className="flex gap-4">
      <Auth />
      <WalletConnect />
    </header>
  );
};
