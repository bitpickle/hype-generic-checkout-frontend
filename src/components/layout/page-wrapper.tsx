import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn('flex flex-col min-h-svh bg-background', className)}>
      {children}
    </div>
  )
}

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn('flex-1 flex flex-col px-5 py-4 gap-6', className)}>
      {children}
    </div>
  )
}
