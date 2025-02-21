import { Link } from '@tanstack/react-router';
import { WalletConnect } from './components/Wallet';
import Logo from '@/assets/Logo.svg?react';

export const Header = () => {
  return (
    <header className="flex gap-4 py-4 z-0">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>
        <WalletConnect />
      </div>
    </header>
  );
};
