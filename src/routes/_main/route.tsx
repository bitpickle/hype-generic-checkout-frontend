import { createFileRoute, Outlet } from '@tanstack/react-router';
import { NavbarMain } from '@/components/navigation/navbar';

export const Route = createFileRoute('/_main')({
  component: RouteComponent,
});

const _navigationData = [
  {
    title: 'Home',
    href: '#',
  },
  {
    title: 'Products',
    href: '#',
  },
  {
    title: 'About Us',
    href: '#',
  },
  {
    title: 'Contacts',
    href: '#',
  },
];

function RouteComponent() {
  return (
    <>
      <NavbarMain />
      <main className="container mx-auto p-8 pt-12">
        <Outlet />
      </main>
    </>
  );
}
