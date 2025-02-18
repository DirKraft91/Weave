import { createFileRoute, Navigate, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {},
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}
