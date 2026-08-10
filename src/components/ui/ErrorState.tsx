import type { HTMLAttributes, ReactNode } from 'react'

import { classNames } from '../../utils/classNames'
import { Card } from './Card'
import { Heading, Text } from './Typography'

export type ErrorStateProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
}

export function ErrorState({
  action,
  className,
  description,
  eyebrow,
  title,
  ...props
}: ErrorStateProps) {
  return (
    <section
      className={classNames('mx-auto w-full max-w-xl text-center', className)}
      {...props}
    >
      <Card className="py-8 sm:py-10">
        {eyebrow ? (
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <Heading level={1} size="md" className={eyebrow ? 'mt-3' : undefined}>
          {title}
        </Heading>
        <Text tone="muted" className="mx-auto mt-3 max-w-md">
          {description}
        </Text>
        {action ? (
          <div className="mt-6 flex justify-center">{action}</div>
        ) : null}
      </Card>
    </section>
  )
}
