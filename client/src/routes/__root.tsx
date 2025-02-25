import { Background } from '@/components/Background';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { NotFoundPage } from './404';

export interface RootRouterContext {
  auth: {
    access: boolean;
  };
}

export const Route = createRootRouteWithContext<RootRouterContext>()({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <div className="absolute w-full z-10 top-3">
        <Header />
      </div>

      <Background />

      <div className="relative z-1">
        <Outlet />
      </div>

      <div className="absolute w-full z-10 bottom-3">
        <Footer />
      </div>

      <TanStackRouterDevtools />
    </div>
  ),
  notFoundComponent: NotFoundPage,
});
