import { describe, it, expect } from 'vitest'
import { cn, formatDate } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'active')).toBe('base active')
  })

  it('resolves tailwind conflicts — last wins', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })
})

describe('formatDate', () => {
  it('formats a date string to Spanish locale', () => {
    // Fixed date to avoid timezone issues
    const result = formatDate('2024-06-15')
    expect(result).toMatch(/junio/i)
    expect(result).toMatch(/2024/)
  })
})
