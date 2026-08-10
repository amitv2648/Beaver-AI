import { Heading, Text } from '../components/ui'

export function HomePage() {
  return (
    <section className="my-auto w-full py-12 text-center">
      <p className="text-sm font-semibold tracking-widest text-primary uppercase">
        Beaver AI
      </p>
      <Heading level={1} className="mt-3">
        Learning, personalized.
      </Heading>
      <Text tone="muted" className="mx-auto mt-4 max-w-xl">
        The application foundation is ready for the learning experiences ahead.
      </Text>
    </section>
  )
}
