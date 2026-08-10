import { Link } from 'react-router-dom'

import { ErrorState } from '../components/ui'

export function NotFoundPage() {
  return (
    <ErrorState
      className="my-auto"
      eyebrow="404"
      title="Page not found"
      description="The page you requested does not exist."
      action={
        <Link
          to="/"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Return home
        </Link>
      }
    />
  )
}
