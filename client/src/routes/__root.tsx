import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChainProvider } from '@cosmos-kit/react';
import { chains, assets } from 'chain-registry';
import { wallets } from '../config/wallets';
import { Background } from '@/components/Background';

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ChainProvider
        signerOptions={{
          preferredSignType: () => {
            return 'amino';
          },
        }}
        chains={chains}
        assetLists={assets}
        wallets={wallets}
      >
        <Background />
        <div className="relative z-1">
          <Outlet />
        </div>
        <TanStackRouterDevtools />
      </ChainProvider>
    </QueryClientProvider>
  ),
});
