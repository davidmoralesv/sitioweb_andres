import { describe, it, expect } from 'vitest'
import { contactSchema } from './validations'

describe('contactSchema', () => {
  const valid = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    subject: 'Consulta de servicio',
    message: 'Hola, me interesa conocer más sobre sus servicios.',
  }

  it('accepts valid data', () => {
    const result = contactSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = contactSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects message under 10 chars', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'Hola' })
    expect(result.success).toBe(false)
  })
})
