import { Link } from 'react-router-dom'

import { Heading, Text } from '../components/ui'

export function NotFoundPage() {
  return (
    <section className="my-auto w-full py-12 text-center">
      <p className="text-sm font-semibold tracking-widest text-primary uppercase">
        404
      </p>
      <Heading level={1} className="mt-3">
        Page not found
      </Heading>
      <Text tone="muted" className="mx-auto mt-4 max-w-xl">
        The page you requested does not exist.
      </Text>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Return home
      </Link>
    </section>
  )
}
