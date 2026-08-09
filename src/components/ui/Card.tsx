import { forwardRef, type ComponentPropsWithoutRef } from 'react'

import { classNames } from '../../utils/classNames'

export type CardProps = ComponentPropsWithoutRef<'div'>

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={classNames(
        'rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6',
        className,
      )}
      {...props}
    />
  )
})
