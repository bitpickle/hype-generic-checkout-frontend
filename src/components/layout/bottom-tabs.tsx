import { Link, useRouterState } from '@tanstack/react-router'
import { Search, Ticket, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

interface TabItem {
  label: string
  icon: React.ReactNode
  to: string
  matchPrefix?: string
}

const tabs: TabItem[] = [
  { label: 'BUSCAR', icon: <Search size={18} />, to: '/', matchPrefix: '/event' },
  { label: 'INGRESSOS', icon: <Ticket size={18} />, to: '/wallet' },
  { label: 'PERFIL', icon: <User size={18} />, to: '/profile' },
]

export function BottomTabs() {
  const { location } = useRouterState()
  const pathname = location.pathname

  return (
    <div className="sticky bottom-0 bg-card border-t border-border px-5 pt-3 pb-5">
      <div className="flex bg-background rounded-[36px] p-1 border border-border h-[62px]">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.to ||
            (tab.matchPrefix ? pathname.startsWith(tab.matchPrefix) : false) ||
            pathname.startsWith(tab.to + '/')

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="relative flex-1 flex items-center justify-center rounded-[26px] transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 bg-primary rounded-[26px]"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <div
                className={cn(
                  'relative z-10 flex flex-col items-center gap-1',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                {tab.icon}
                <span className="text-[10px] font-semibold tracking-wider font-body">
                  {tab.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
