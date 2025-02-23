import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@heroui/toast';
import './input.css';
import { FC } from 'react';
import { useAuthStore } from './contexts';

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
  </HeroUIProvider>,
);
