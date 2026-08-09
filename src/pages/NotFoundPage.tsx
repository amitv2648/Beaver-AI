import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="my-auto w-full py-12 text-center">
      <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
        The page you requested does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
      >
        Return home
      </Link>
    </section>
  )
}
