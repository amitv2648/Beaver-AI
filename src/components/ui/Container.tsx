import { forwardRef, type ComponentPropsWithoutRef } from 'react'

import { classNames } from '../../utils/classNames'

export type ContainerProps = ComponentPropsWithoutRef<'div'>

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={classNames(
          'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
          className,
        )}
        {...props}
      />
    )
  },
)
