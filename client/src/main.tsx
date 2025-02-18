import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter, NotFoundRoute } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { Route as rootRoute } from './routes/__root.tsx';

const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  component: () => '404 Not Found',
});

const router = createRouter({ routeTree, notFoundRoute });
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
