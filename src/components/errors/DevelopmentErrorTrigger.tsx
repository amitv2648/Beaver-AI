const errorSimulationParameter = 'simulateAppError'

export function DevelopmentErrorTrigger() {
  const shouldSimulateError =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get(
      errorSimulationParameter,
    ) === 'true'

  if (shouldSimulateError) {
    throw new Error('Development-only simulated application error')
  }

  return null
}
