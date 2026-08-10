import type { HTMLAttributes } from 'react'

import { classNames } from '../../utils/classNames'

export type LoadingStateProps = HTMLAttributes<HTMLDivElement> & {
  label?: string
}

export function LoadingState({
  className,
  label = 'Loading',
  ...props
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={classNames(
        'flex items-center justify-center gap-3 py-8 text-sm text-muted',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none"
      />
      <span>{label}</span>
    </div>
  )
}
