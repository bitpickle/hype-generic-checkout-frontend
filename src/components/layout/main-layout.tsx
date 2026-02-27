import { Outlet } from '@tanstack/react-router';
import { Header } from './header';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 md:px-6">
          <Outlet />
        </div>
      </main>
      <footer className="border-t py-6 md:py-0 bg-muted/40">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row md:px-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Eventos. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
