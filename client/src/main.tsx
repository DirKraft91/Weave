import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@heroui/toast';
import './input.css';
import { FC } from 'react';
import { useAuthStore } from './contexts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChainProvider } from '@cosmos-kit/react';
import { assets, chains } from 'chain-registry';
import { wallets } from './config/wallets';

const router = createRouter({
  routeTree,
  defaultErrorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
  defaultNotFoundComponent: () => {
    return <div>404 Not Found</div>;
  },
  context: {
    auth: {
      access: false,
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchInterval: false,
    },
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const RouterProviderWithContext: FC = () => {
  const { authToken } = useAuthStore();

  return <RouterProvider router={router} context={{ auth: { access: !!authToken } }} />;
};

createRoot(document.getElementById('root')!).render(
  <HeroUIProvider>
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
        <RouterProviderWithContext />
        <div className="relative" style={{ zIndex: 51 }}>
          <ToastProvider
            maxVisibleToasts={1}
            toastOffset={20}
            placement="bottom-right"
            toastProps={{
              hideCloseButton: true,
            }}
          />
        </div>
      </ChainProvider>
    </QueryClientProvider>
  </HeroUIProvider>,
);
