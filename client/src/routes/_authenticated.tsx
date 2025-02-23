import { AsideNavigation } from '@/components/AsideNavigation';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/contexts/auth';
import { createFileRoute, Navigate, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.access) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { authToken } = useAuthStore();

  if (!authToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 gap-8 container mx-auto">
        <aside className="w-64 flex">
          <AsideNavigation />
        </aside>
        <main className="flex flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
