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
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      <Header />


      <Background />

      <div className="relative z-1 flex-1 overflow-y-auto overflow-x-hidden" data-scrollable="true">
        <Outlet />
      </div>

      <div className="fixed w-full z-10 bottom-3">
        <Footer />
      </div>

      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  ),
  notFoundComponent: NotFoundPage,
});
