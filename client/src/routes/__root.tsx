import { Background } from '@/components/Background';
import { ChainProvider } from '@cosmos-kit/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { assets, chains } from 'chain-registry';
import { wallets } from '../config/wallets';

const queryClient = new QueryClient();

export interface RootRouterContext {
  auth: {
    access: boolean;
  };
}

export const Route = createRootRouteWithContext<RootRouterContext>()({
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
