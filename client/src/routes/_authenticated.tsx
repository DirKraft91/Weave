import { AsideNavigation } from '@/components/AsideNavigation';
import { Header } from '@/components/Header';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => { },
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
