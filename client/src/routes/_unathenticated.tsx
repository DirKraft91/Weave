import { Header } from '@/components/Header';
import { createFileRoute, Link, Navigate, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_unathenticated')({
  beforeLoad: async ({ context }) => {
    console.log('beforeLoad', context);
  },
  component: UnauthenticatedLayout,
});

function UnauthenticatedLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-gray-100">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-600">© 2024 Your App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
