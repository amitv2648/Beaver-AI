type ErrorContext = {
  componentStack?: string | null
}

export function logDevelopmentError(
  error: unknown,
  context: ErrorContext = {},
) {
  if (!import.meta.env.DEV) {
    return
  }

  console.error('[Beaver AI] Unexpected application error', {
    error,
    componentStack: context.componentStack,
  })
}
