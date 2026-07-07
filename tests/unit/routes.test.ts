import { describe, it, expect } from 'vitest'
import { isProtectedRoute, isAuthRoute } from '@/lib/utils/routes'

describe('isProtectedRoute', () => {
  it('protects /dashboard', () => {
    expect(isProtectedRoute('/dashboard')).toBe(true)
  })

  it('protects nested /dashboard/sub', () => {
    expect(isProtectedRoute('/dashboard/sub')).toBe(true)
  })

  it('protects /subject/algebra-lineal', () => {
    expect(isProtectedRoute('/subject/algebra-lineal')).toBe(true)
  })

  it('protects /session/abc123', () => {
    expect(isProtectedRoute('/session/abc123')).toBe(true)
  })

  it('does not protect /login', () => {
    expect(isProtectedRoute('/login')).toBe(false)
  })

  it('does not protect /', () => {
    expect(isProtectedRoute('/')).toBe(false)
  })

  it('does not protect /api/chat', () => {
    expect(isProtectedRoute('/api/chat')).toBe(false)
  })

  it('does not protect /auth/callback', () => {
    expect(isProtectedRoute('/auth/callback')).toBe(false)
  })
})

describe('isAuthRoute', () => {
  it('identifies /login', () => {
    expect(isAuthRoute('/login')).toBe(true)
  })

  it('identifies /register', () => {
    expect(isAuthRoute('/register')).toBe(true)
  })

  it('identifies /forgot-password', () => {
    expect(isAuthRoute('/forgot-password')).toBe(true)
  })

  it('does not identify /dashboard', () => {
    expect(isAuthRoute('/dashboard')).toBe(false)
  })

  it('does not identify /', () => {
    expect(isAuthRoute('/')).toBe(false)
  })

  it('does not identify /api/chat', () => {
    expect(isAuthRoute('/api/chat')).toBe(false)
  })
})
