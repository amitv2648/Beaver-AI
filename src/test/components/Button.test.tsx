import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../../components/ui'

describe('Button', () => {
  it('uses a safe default type and handles interaction', () => {
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Continue</Button>)

    const button = screen.getByRole('button', { name: 'Continue' })

    expect(button.getAttribute('type')).toBe('button')

    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledOnce()
  })
})
