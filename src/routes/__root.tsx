import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <div className="mx-auto w-full max-w-[480px] min-h-svh">
        <Outlet />
      </div>
      <Toaster position="top-center" richColors />
    </>
  )
}
