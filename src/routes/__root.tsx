import { createRootRoute } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { Layout } from '@/components/layout/main-layout';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Layout />
      <Toaster />
    </>
  );
}
