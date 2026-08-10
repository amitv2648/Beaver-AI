import type { HTMLAttributes } from 'react'

import { classNames } from '../../utils/classNames'

type HeadingLevel = 1 | 2 | 3 | 4
type HeadingSize = 'sm' | 'md' | 'lg' | 'xl'

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel
  size?: HeadingSize
}

const headingSizeClasses: Record<HeadingSize, string> = {
  sm: 'text-heading-sm',
  md: 'text-heading-md',
  lg: 'text-heading-lg',
  xl: 'text-heading-xl',
}

export function Heading({
  className,
  level = 2,
  size = 'lg',
  ...props
}: HeadingProps) {
  const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'

  return (
    <Component
      className={classNames(
        'font-bold tracking-tight text-foreground',
        headingSizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}

type TextElement = 'p' | 'span'
type TextSize = 'sm' | 'md' | 'lg'
type TextTone = 'default' | 'muted'

export type TextProps = HTMLAttributes<HTMLElement> & {
  as?: TextElement
  size?: TextSize
  tone?: TextTone
}

const textSizeClasses: Record<TextSize, string> = {
  sm: 'text-sm leading-6',
  md: 'text-base leading-7',
  lg: 'text-lg leading-8',
}

const textToneClasses: Record<TextTone, string> = {
  default: 'text-foreground',
  muted: 'text-muted',
}

export function Text({
  as: Component = 'p',
  className,
  size = 'md',
  tone = 'default',
  ...props
}: TextProps) {
  return (
    <Component
      className={classNames(
        textSizeClasses[size],
        textToneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}
