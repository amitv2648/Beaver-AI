import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Container } from '../ui'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <Container className="flex h-16 items-center">
          <Link
            to="/"
            className="rounded-sm text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Beaver AI
          </Link>
        </Container>
      </header>

      <main
        id="main-content"
        className="flex flex-1 py-10 sm:py-14"
      >
        <Container className="flex">{children}</Container>
      </main>

      <footer className="border-t border-border bg-surface">
        <Container className="flex items-center py-5 text-sm text-muted">
          <p>© {new Date().getFullYear()} Beaver AI</p>
        </Container>
      </footer>
    </div>
  )
}
