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
      <header className="bg-white shadow">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">
              Your App
            </Link>
          </div>
        </nav>
      </header>

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
