import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { TooltipProvider } from "./components/ui/tooltip"
import { initApiClients } from './lib/api'
import { ThemeProvider } from "./providers/theme-provider"
import { routeTree } from './routeTree.gen'
import "./index.css"

initApiClients()

const router = createRouter({ routeTree })
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// biome-ignore lint/style/noNonNullAssertion: always have a root element
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <ThemeProvider defaultTheme="system">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </TooltipProvider>
  </StrictMode>
)
