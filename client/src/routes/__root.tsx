import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChainProvider } from '@cosmos-kit/react';
import { chains, assets } from 'chain-registry';
import { HeroUIProvider } from '@heroui/react';
import { wallets } from '../config/wallets';

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
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
          <Outlet />
          <TanStackRouterDevtools />
        </ChainProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  ),
});
