import Logo from '@/assets/Logo.svg?react';
import { useScrollDetection } from '@/hooks/useScrollDetection';
import { Link } from '@tanstack/react-router';
import { HeaderMenu } from './components/HeaderMenu';
import { WalletConnect } from './components/Wallet';

export const Header = () => {
  const isScrolled = useScrollDetection(10);

  return (
    <header
      className={`fixed top-0 left-0 right-0 flex gap-4 py-4 z-10 transition-all duration-300 ${isScrolled ? 'bg-[#141517] backdrop-blur-md shadow-md' : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>
        <HeaderMenu />
        <WalletConnect />
      </div>
    </header>
  );
};
