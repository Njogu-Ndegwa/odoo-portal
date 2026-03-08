'use client'

import { ApolloProvider } from '@apollo/client'
import portalApolloClient from '@/lib/portal-apollo-client'
import Logo from '@/components/ui/logo'
import ThemeToggle from '@/components/theme-toggle'
import DropdownProfile from '@/components/dropdown-profile'
import { isAuth } from '@/lib/auth'

function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={portalApolloClient}>
      <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-gray-50 via-violet-50/40 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <header className="sticky top-0 z-30 border-b border-gray-200/80 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Logo />
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <DropdownProfile align="right" />
              </div>
            </div>
          </div>
        </header>

        <main className="grow overflow-y-auto">
          {children}
        </main>
      </div>
    </ApolloProvider>
  )
}

export default isAuth(PortalLayout)
