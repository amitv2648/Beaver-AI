import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'

import { classNames } from '../../utils/classNames'

export type InputProps = ComponentPropsWithoutRef<'input'> & {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    className,
    description,
    error,
    id: providedId,
    label,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy =
    [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={ariaInvalid ?? Boolean(error)}
        className={classNames(
          'min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted sm:text-sm',
          Boolean(error) &&
            'border-danger focus:border-danger focus:ring-danger/20',
          className,
        )}
        {...props}
      />
      {description ? (
        <p id={descriptionId} className="mt-1.5 text-sm text-muted">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
})
