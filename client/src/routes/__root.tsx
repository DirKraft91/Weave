import { Background } from '@/components/Background';
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
      <div className="absolute w-full">
        <Header />
      </div>

      <Background />

      <div className="relative z-1">
        <Outlet />
      </div>

      <TanStackRouterDevtools />
    </div>
  ),
  notFoundComponent: NotFoundPage,
});
