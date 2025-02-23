import { Header } from '@/components/Header';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_unathenticated')({
  component: UnauthenticatedLayout,
});

function UnauthenticatedLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-1 container mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
