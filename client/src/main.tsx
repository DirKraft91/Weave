import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { HeroUIProvider } from '@heroui/react';
import { ToastProvider } from '@heroui/toast';
import './input.css';

const router = createRouter({
  routeTree,
  defaultErrorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
  defaultNotFoundComponent: () => {
    return <div>404 Not Found</div>;
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <HeroUIProvider>
    <RouterProvider router={router} />
    <ToastProvider
      maxVisibleToasts={1}
      toastOffset={20}
      placement="bottom-right"
      toastProps={{
        hideCloseButton: true,
      }}
    />
  </HeroUIProvider>,
);
