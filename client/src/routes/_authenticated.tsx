import { createFileRoute, Navigate, Outlet, redirect } from '@tanstack/react-router';
import { Header } from '@/components/Header';
import { AsideNavigation } from '@/components/AsideNavigation';
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {},
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
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
