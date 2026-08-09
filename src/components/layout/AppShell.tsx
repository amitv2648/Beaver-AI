import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <span className="text-lg font-semibold tracking-tight">Beaver AI</span>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
      >
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-5 text-sm text-slate-600 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Beaver AI</p>
        </div>
      </footer>
    </div>
  )
}
