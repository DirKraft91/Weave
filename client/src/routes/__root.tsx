import { Background } from '@/components/Background';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export interface RootRouterContext {
  auth: {
    access: boolean;
  };
}

export const Route = createRootRouteWithContext<RootRouterContext>()({
  component: () => (
    <>
      <Background />
      <div className="relative z-1">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
