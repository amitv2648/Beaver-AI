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
          className="mb-1.5 block text-sm font-medium text-slate-800"
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
          'min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-950/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 sm:text-sm',
          Boolean(error) &&
            'border-red-600 focus:border-red-600 focus:ring-red-600/15',
          className,
        )}
        {...props}
      />
      {description ? (
        <p id={descriptionId} className="mt-1.5 text-sm text-slate-600">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
})
