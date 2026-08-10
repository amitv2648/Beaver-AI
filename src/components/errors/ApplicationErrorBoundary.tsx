import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from 'react'

import { logDevelopmentError } from '../../utils/errorLogging'
import { Button, Container, ErrorState } from '../ui'

type ApplicationErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}

type ApplicationErrorBoundaryState = {
  hasError: boolean
}

function ApplicationErrorFallback() {
  const returnHome = () => {
    window.location.assign('/')
  }

  return (
    <main className="flex min-h-screen items-center bg-background py-10">
      <Container>
        <ErrorState
          role="alert"
          aria-live="assertive"
          eyebrow="Something went wrong"
          title="We couldn't load Beaver AI"
          description="An unexpected error occurred. Please return to the application and try again."
          action={<Button onClick={returnHome}>Return to Beaver AI</Button>}
        />
      </Container>
    </main>
  )
}

export class ApplicationErrorBoundary extends Component<
  ApplicationErrorBoundaryProps,
  ApplicationErrorBoundaryState
> {
  state: ApplicationErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ApplicationErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    logDevelopmentError(error, {
      componentStack: errorInfo.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ApplicationErrorFallback />
    }

    return this.props.children
  }
}
